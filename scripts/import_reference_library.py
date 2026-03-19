from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import shutil
import unicodedata
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any
from xml.etree import ElementTree


SCREENSHOT_COLLECTIONS = {
    "Test 2 study guide": {
        "id": "test-2-study-guide",
        "title": "Test 2 study guide",
        "description": "Study-guide screenshots covering quiz questions, diagrams, and worked items.",
    },
    "test 2 no 2": {
        "id": "test-2-no-2",
        "title": "Test 2 no. 2",
        "description": "Screenshot set for the second test problem group.",
    },
    "test 2 no 3": {
        "id": "test-2-no-3",
        "title": "Test 2 no. 3",
        "description": "Screenshot set for the third test problem group.",
    },
    "Ch 15-16 screen shots": {
        "id": "ch-15-16-screen-shots",
        "title": "Ch 15-16 screen shots",
        "description": "Chapter 15 and 16 screenshots preserved as duplicate-source provenance.",
    },
}

COLLECTION_PRIORITY = {
    "Test 2 study guide": 0,
    "test 2 no 2": 1,
    "test 2 no 3": 2,
    "Ch 15-16 screen shots": 3,
    "root": 4,
}

DOCX_NAMESPACE = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


@dataclass(frozen=True)
class ArchiveEntry:
    original_path: str
    original_name: str
    bytes_data: bytes
    size_bytes: int
    sha256: str
    extension: str
    top_level: str


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only).strip("-").lower()
    return slug or "file"


def load_entries(zip_path: Path) -> list[ArchiveEntry]:
    entries: list[ArchiveEntry] = []

    with zipfile.ZipFile(zip_path) as archive:
        for info in archive.infolist():
            if info.is_dir():
                continue

            original_path = str(PurePosixPath(info.filename))
            original_name = PurePosixPath(info.filename).name
            bytes_data = archive.read(info)
            sha256 = hashlib.sha256(bytes_data).hexdigest()
            extension = Path(original_name).suffix.lower()

            parts = PurePosixPath(info.filename).parts
            top_level = parts[0] if len(parts) > 1 else "root"

            entries.append(
                ArchiveEntry(
                    original_path=original_path,
                    original_name=original_name,
                    bytes_data=bytes_data,
                    size_bytes=len(bytes_data),
                    sha256=sha256,
                    extension=extension,
                    top_level=top_level,
                ),
            )

    return entries


def choose_canonical_entries(entries: list[ArchiveEntry]) -> tuple[list[ArchiveEntry], list[dict[str, Any]]]:
    entries_by_hash: dict[str, list[ArchiveEntry]] = defaultdict(list)
    for entry in entries:
        entries_by_hash[entry.sha256].append(entry)

    canonical_entries: list[ArchiveEntry] = []
    duplicate_groups: list[dict[str, Any]] = []

    for grouped_entries in entries_by_hash.values():
        grouped_entries.sort(
            key=lambda entry: (
                COLLECTION_PRIORITY.get(entry.top_level, 99),
                entry.original_path.lower(),
            )
        )
        canonical = grouped_entries[0]
        canonical_entries.append(canonical)

        if len(grouped_entries) > 1:
            duplicate_groups.append(
                {
                    "sha256": canonical.sha256,
                    "canonicalOriginalPath": canonical.original_path,
                    "duplicateOriginalPaths": [
                        entry.original_path for entry in grouped_entries[1:]
                    ],
                }
            )

    canonical_entries.sort(
        key=lambda entry: (
            COLLECTION_PRIORITY.get(entry.top_level, 99),
            entry.original_path.lower(),
        )
    )
    duplicate_groups.sort(key=lambda group: group["canonicalOriginalPath"].lower())

    return canonical_entries, duplicate_groups


def extract_docx_outline(bytes_data: bytes) -> list[str]:
    with zipfile.ZipFile(io.BytesIO(bytes_data)) as archive:
        document_xml = archive.read("word/document.xml")

    root = ElementTree.fromstring(document_xml)
    outline: list[str] = []

    for paragraph in root.findall(".//w:p", DOCX_NAMESPACE):
        text_parts = [node.text for node in paragraph.findall(".//w:t", DOCX_NAMESPACE) if node.text]
        line = re.sub(r"\s+", " ", "".join(text_parts)).strip()
        if line:
            outline.append(line)

    return outline


def inspect_pdf(bytes_data: bytes) -> dict[str, Any]:
    try:
        from pypdf import PdfReader
    except ImportError:
        return {"pageCount": None, "machineReadableText": False}

    reader = PdfReader(io.BytesIO(bytes_data))
    has_machine_text = False
    for page in reader.pages[:3]:
        if (page.extract_text() or "").strip():
            has_machine_text = True
            break

    return {"pageCount": len(reader.pages), "machineReadableText": has_machine_text}


def build_output_path(entry: ArchiveEntry) -> Path:
    if entry.top_level == "root":
        return Path("homework") / f"{slugify(Path(entry.original_name).stem)}{entry.extension}"

    collection = SCREENSHOT_COLLECTIONS.get(entry.top_level)
    if collection is None:
        raise ValueError(f"Unexpected top-level archive folder: {entry.top_level}")

    return (
        Path("screenshots")
        / collection["id"]
        / f"{slugify(Path(entry.original_name).stem)}{entry.extension}"
    )


def write_canonical_files(output_root: Path, canonical_entries: list[ArchiveEntry]) -> dict[str, str]:
    if output_root.exists():
        shutil.rmtree(output_root, onexc=remove_readonly)
    output_root.mkdir(parents=True, exist_ok=True)

    written_paths: dict[str, str] = {}

    for entry in canonical_entries:
        relative_path = build_output_path(entry)
        destination = output_root / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(entry.bytes_data)
        written_paths[entry.sha256] = "/" + destination.relative_to(output_root.parent).as_posix()

    return written_paths


def remove_readonly(function: Any, path: str, _: BaseException) -> None:
    os.chmod(path, 0o700)
    function(path)


def build_manifest(
    zip_path: Path,
    canonical_entries: list[ArchiveEntry],
    duplicate_groups: list[dict[str, Any]],
    public_paths: dict[str, str],
) -> dict[str, Any]:
    documents: list[dict[str, Any]] = []
    screenshot_collections: dict[str, dict[str, Any]] = {}

    duplicate_lookup = {
        group["sha256"]: group["duplicateOriginalPaths"] for group in duplicate_groups
    }

    for entry in canonical_entries:
        public_path = public_paths[entry.sha256]
        duplicate_sources = duplicate_lookup.get(entry.sha256, [])

        if entry.top_level == "root":
            document = {
                "id": slugify(Path(entry.original_name).stem),
                "title": entry.original_name,
                "kind": entry.extension.lstrip("."),
                "originalName": entry.original_name,
                "originalPath": entry.original_path,
                "publicPath": public_path,
                "sizeBytes": entry.size_bytes,
                "sha256": entry.sha256,
                "duplicateSourcePaths": duplicate_sources,
            }

            if entry.extension == ".docx":
                outline = extract_docx_outline(entry.bytes_data)
                document["paragraphCount"] = len(outline)
                document["outline"] = outline[:18]
            elif entry.extension == ".pdf":
                document.update(inspect_pdf(entry.bytes_data))
                document["note"] = (
                    "This PDF is stored as the original binary source file. "
                    "In this environment it does not expose reliable machine-readable text."
                )

            documents.append(document)
            continue

        collection_info = SCREENSHOT_COLLECTIONS[entry.top_level]
        collection = screenshot_collections.setdefault(
            collection_info["id"],
            {
                "id": collection_info["id"],
                "title": collection_info["title"],
                "description": collection_info["description"],
                "sortOrder": COLLECTION_PRIORITY.get(entry.top_level, 99),
                "originalFolders": [entry.top_level],
                "duplicateSourceFolders": [],
                "items": [],
            },
        )

        for duplicate_path in duplicate_sources:
            duplicate_top_level = PurePosixPath(duplicate_path).parts[0]
            if duplicate_top_level != entry.top_level and duplicate_top_level not in collection["duplicateSourceFolders"]:
                collection["duplicateSourceFolders"].append(duplicate_top_level)

        collection["items"].append(
            {
                "id": f"{collection_info['id']}-{slugify(Path(entry.original_name).stem)}",
                "title": Path(entry.original_name).stem,
                "originalName": entry.original_name,
                "originalPath": entry.original_path,
                "publicPath": public_path,
                "sizeBytes": entry.size_bytes,
                "sha256": entry.sha256,
                "duplicateSourcePaths": duplicate_sources,
            }
        )

    documents.sort(key=lambda document: document["title"].lower())

    ordered_collections: list[dict[str, Any]] = []
    for collection in sorted(
        screenshot_collections.values(),
        key=lambda item: (item["sortOrder"], item["title"].lower()),
    ):
        collection["items"].sort(key=lambda item: item["title"].lower())
        collection["previewImagePaths"] = [
            item["publicPath"] for item in collection["items"][:4]
        ]
        collection["itemCount"] = len(collection["items"])
        collection["duplicateSourceFolders"].sort(key=str.lower)
        collection.pop("sortOrder", None)
        ordered_collections.append(collection)

    total_archive_files = len(canonical_entries) + sum(
        len(group["duplicateOriginalPaths"]) for group in duplicate_groups
    )
    duplicate_file_count = sum(len(group["duplicateOriginalPaths"]) for group in duplicate_groups)
    screenshot_count = sum(collection["itemCount"] for collection in ordered_collections)

    return {
        "importedAt": "2026-03-18",
        "sourceArchiveName": zip_path.name,
        "stats": {
            "totalArchiveFiles": total_archive_files,
            "uniqueCanonicalFiles": len(canonical_entries),
            "documentCount": len(documents),
            "screenshotCount": screenshot_count,
            "duplicateGroupCount": len(duplicate_groups),
            "duplicateFilesRemoved": duplicate_file_count,
        },
        "documents": documents,
        "screenshotCollections": ordered_collections,
        "duplicateGroups": duplicate_groups,
    }


def write_manifest(output_path: Path, manifest: dict[str, Any]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_json = json.dumps(manifest, indent=2)
    contents = (
        "export const referenceLibrary = "
        + manifest_json
        + " as const\n\n"
        + "export type ReferenceLibrary = typeof referenceLibrary\n"
    )
    output_path.write_text(contents, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import homework and screenshot assets into the repo reference library."
    )
    parser.add_argument(
        "zip_path",
        type=Path,
        help="Path to the source zip archive.",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repo root. Defaults to the parent of this script.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = args.project_root.resolve()
    zip_path = args.zip_path.resolve()

    if not zip_path.exists():
        raise FileNotFoundError(f"Archive not found: {zip_path}")

    entries = load_entries(zip_path)
    canonical_entries, duplicate_groups = choose_canonical_entries(entries)

    public_root = project_root / "public" / "reference-library"
    public_paths = write_canonical_files(public_root, canonical_entries)

    manifest = build_manifest(zip_path, canonical_entries, duplicate_groups, public_paths)
    manifest_path = project_root / "src" / "data" / "referenceLibrary.ts"
    write_manifest(manifest_path, manifest)

    print(
        "Imported reference library:",
        json.dumps(manifest["stats"], indent=2),
    )


if __name__ == "__main__":
    main()

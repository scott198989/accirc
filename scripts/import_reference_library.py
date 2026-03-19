from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DOCX_NAMESPACE = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

QUIZ_17_MANUAL_QUESTIONS = [
    {
        "questionNumber": "1",
        "classification": "true-false",
        "promptText": "The equivalent circuit is used in determining the source current in series-parallel AC networks.",
    },
    {
        "questionNumber": "2",
        "classification": "calculation",
        "promptText": "Figure 16.5: determine the branch current I1 from the shown source and branch impedances.",
    },
    {
        "questionNumber": "3",
        "classification": "concept",
        "promptText": "Figure 16.3: choose the current relationship that correctly describes branch current I1.",
    },
    {
        "questionNumber": "4",
        "classification": "calculation",
        "promptText": "Figure 16.5: determine the total admittance YT of the circuit.",
    },
    {
        "questionNumber": "5",
        "classification": "calculation",
        "promptText": "Figure 16.6: determine the total impedance ZT of the circuit.",
    },
    {
        "questionNumber": "6",
        "classification": "true-false",
        "promptText": "The total impedance of two parallel impedances equals the sum of the impedances divided by their product.",
    },
    {
        "questionNumber": "7",
        "classification": "true-false",
        "promptText": "Figure 16.2 statement about the total impedance being purely resistive.",
    },
    {
        "questionNumber": "8",
        "classification": "calculation",
        "promptText": "Figure 16.2: determine the total impedance ZT of the circuit.",
    },
    {
        "questionNumber": "9",
        "classification": "calculation",
        "promptText": "Figure 16.9: determine the current through the 11.5 ohm capacitor branch.",
    },
    {
        "questionNumber": "10",
        "classification": "concept",
        "promptText": "Figure 16.4: choose the correct current relationship for the mixed network.",
    },
    {
        "questionNumber": "11",
        "classification": "calculation",
        "promptText": "Figure 16.1: determine the total impedance ZT of the circuit.",
    },
    {
        "questionNumber": "12",
        "classification": "true-false",
        "promptText": "The fundamental concept for solving series-parallel AC networks is different from solving series-parallel DC networks.",
    },
    {
        "questionNumber": "13",
        "classification": "true-false",
        "promptText": "If the total impedance has a negative phase angle, the network is capacitive in nature.",
    },
    {
        "questionNumber": "14",
        "classification": "calculation",
        "promptText": "Figure 16.6: determine the total current I.",
    },
    {
        "questionNumber": "15",
        "classification": "calculation",
        "promptText": "Figure 16.5: determine the value of current I1.",
    },
    {
        "questionNumber": "16",
        "classification": "true-false",
        "promptText": "Combining the impedance of more than one element can help determine the total voltage across a series combination.",
    },
    {
        "questionNumber": "17",
        "classification": "true-false",
        "promptText": "At higher frequency, XC is better approximated as a short circuit for AC conductors.",
    },
    {
        "questionNumber": "18",
        "classification": "calculation",
        "promptText": "Figure 16.9: determine the current through the 20 ohm resistor.",
    },
    {
        "questionNumber": "19",
        "classification": "calculation",
        "promptText": "Figure 16.4: given source voltage and source current phasors, determine the total impedance ZT.",
    },
    {
        "questionNumber": "20",
        "classification": "true-false",
        "promptText": "Figure 16.1: the total impedance ZT is independent of the applied frequency.",
    },
    {
        "questionNumber": "21",
        "classification": "true-false",
        "promptText": "Figure 16.1: the current divider rule can be applied to determine the current through the capacitor.",
    },
    {
        "questionNumber": "22",
        "classification": "true-false",
        "promptText": "The effect of a capacitor in the dual analog is negligible and allows AC to pass with little disturbance.",
    },
    {
        "questionNumber": "23",
        "classification": "calculation",
        "promptText": "Figure 16.1: given the applied frequency, determine the inductor value L.",
    },
    {
        "questionNumber": "24",
        "classification": "true-false",
        "promptText": "Figure 16.1: current I2 may be found by dividing E by ZP.",
    },
    {
        "questionNumber": "25",
        "classification": "true-false",
        "promptText": "A ground-fault circuit interrupter does not prevent all shock current, but it does cut power quickly.",
    },
    {
        "questionNumber": "26",
        "classification": "concept",
        "promptText": "Figure 16.3: choose the equation that correctly describes the source voltage E.",
    },
    {
        "questionNumber": "27",
        "classification": "calculation",
        "promptText": "Figure 16.9: determine the current through the 20 ohm resistor.",
    },
    {
        "questionNumber": "28",
        "classification": "true-false",
        "promptText": "Ladder networks do not require the total impedance to be known before determining total current.",
    },
    {
        "questionNumber": "29",
        "classification": "calculation",
        "promptText": "Figure 16.1: given the source current phasor, determine the current through the coil.",
    },
    {
        "questionNumber": "30",
        "classification": "concept",
        "promptText": "Figure 16.3: choose the equation that correctly describes the total impedance ZT.",
    },
    {
        "questionNumber": "31",
        "classification": "concept",
        "promptText": "Figure 16.4: choose the equation that correctly describes the total impedance ZT.",
    },
    {
        "questionNumber": "32",
        "classification": "true-false",
        "promptText": "Determining source current is the most critical step in solving series-parallel AC networks.",
    },
    {
        "questionNumber": "33",
        "classification": "true-false",
        "promptText": "Figure 16.1 statement comparing the total impedance to R, XC, and XL.",
    },
    {
        "questionNumber": "34",
        "classification": "concept",
        "promptText": "Figure 16.2: as frequency increases, describe how the total impedance changes.",
    },
]


@dataclass(frozen=True)
class FileSource:
    id: str
    kind: str
    scope: str
    title: str
    chapters: list[str]
    description: str
    source_path: Path
    output_name: str
    source_provenance: list[str]
    note: str | None = None


@dataclass(frozen=True)
class ScreenshotSource:
    id: str
    kind: str
    scope: str
    title: str
    chapters: list[str]
    description: str
    source_dir: Path
    source_provenance: list[str]
    extraction_note: str | None = None
    note: str | None = None


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return "-".join(part for part in "".join(
        character.lower() if character.isalnum() else " "
        for character in ascii_only
    ).split()) or "file"


def sha256_for_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_docx_paragraphs(path: Path) -> list[str]:
    import zipfile
    from xml.etree import ElementTree

    with zipfile.ZipFile(path) as archive:
        document_xml = archive.read("word/document.xml")

    root = ElementTree.fromstring(document_xml)
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:p", DOCX_NAMESPACE):
        text_parts = [node.text for node in paragraph.findall(".//w:t", DOCX_NAMESPACE) if node.text]
        line = " ".join("".join(text_parts).split())
        if line:
            paragraphs.append(line)

    return paragraphs


def read_pdf_pages(path: Path) -> list[str]:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    return [" ".join((page.extract_text() or "").split()) for page in reader.pages]


def file_item_manifest(path: Path, public_path: str) -> dict[str, Any]:
    data = path.read_bytes()
    return {
        "id": slugify(path.stem),
        "title": path.name,
        "publicPath": public_path,
        "sizeBytes": len(data),
        "sha256": sha256_for_bytes(data),
    }


def screenshot_items_manifest(source_dir: Path, public_prefix: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for path in sorted(source_dir.glob("*.png")):
        data = path.read_bytes()
        slug = slugify(path.stem)
        items.append(
            {
                "id": slug,
                "title": path.stem,
                "publicPath": f"{public_prefix}/{slug}{path.suffix.lower()}",
                "sizeBytes": len(data),
                "sha256": sha256_for_bytes(data),
            }
        )
    return items


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def copy_file(source: Path, destination: Path, public_root: Path) -> str:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    return "/" + destination.relative_to(public_root.parent).as_posix()


def copy_directory(source: Path, destination: Path, public_root: Path) -> list[str]:
    destination.mkdir(parents=True, exist_ok=True)
    public_paths: list[str] = []
    for path in sorted(source.glob("*.png")):
        slug = slugify(path.stem)
        destination_path = destination / f"{slug}{path.suffix.lower()}"
        shutil.copy2(path, destination_path)
        public_paths.append("/" + destination_path.relative_to(public_root.parent).as_posix())
    return public_paths


def build_sources(study_root: Path, raw_root: Path) -> tuple[list[FileSource], list[ScreenshotSource]]:
    file_sources = [
        FileSource(
            id="hw-15",
            kind="homework",
            scope="canonical",
            title="HW 15",
            chapters=["15"],
            description="Readable Chapter 15 homework source selected as the canonical assignment copy.",
            source_path=study_root / "homework" / "Scott Tuschl HW Cha 15 A000834342.docx",
            output_name="scott-tuschl-hw-15.docx",
            source_provenance=[
                str(study_root / "homework" / "Scott Tuschl HW Cha 15 A000834342.docx"),
                str(raw_root / "Scott Tuschl HW 15 A000834342.pdf"),
            ],
            note="The readable DOCX is canonical; the older PDF export remains in the raw archive provenance only.",
        ),
        FileSource(
            id="hw-16",
            kind="homework",
            scope="canonical",
            title="HW 16",
            chapters=["16"],
            description="Readable Chapter 16 homework PDF selected as the canonical assignment copy.",
            source_path=study_root / "homework" / "Scott Tuschl ch 16 HW (1).pdf",
            output_name="scott-tuschl-hw-16.pdf",
            source_provenance=[
                str(study_root / "homework" / "Scott Tuschl ch 16 HW (1).pdf"),
                str(raw_root / "Scott Tuschl ch 16 HW.docx"),
            ],
            note="The readable PDF is canonical because it preserves the assigned Chapter 16 prompts cleanly in one place.",
        ),
        FileSource(
            id="hw-17",
            kind="homework",
            scope="canonical",
            title="HW 17",
            chapters=["17"],
            description="Readable Chapter 17 homework source selected as the canonical assignment copy.",
            source_path=study_root / "homework" / "Scott Tuschl HW 17.docx",
            output_name="scott-tuschl-hw-17.docx",
            source_provenance=[
                str(study_root / "homework" / "Scott Tuschl HW 17.docx"),
            ],
        ),
    ]

    screenshot_sources = [
        ScreenshotSource(
            id="quiz-15-16",
            kind="quiz",
            scope="canonical",
            title="Quiz 15-16",
            chapters=["15", "16"],
            description="Canonical screenshot set for the combined Chapter 15 and 16 quiz.",
            source_dir=study_root / "screenshots" / "test-2-no-2",
            source_provenance=[
                str(study_root / "screenshots" / "test-2-no-2"),
                str(raw_root / "drive-download-20260318T235336Z-3-001" / "test 2 no 2"),
                str(raw_root / "Ch 15-16 screen shots"),
            ],
            extraction_note="OCR text was preserved from the exported quiz screenshot set to support question-level cataloging.",
            note="The raw Ch 15-16 folder is preserved as provenance, but the canonical question images come from the dedicated quiz export.",
        ),
        ScreenshotSource(
            id="quiz-17",
            kind="quiz",
            scope="canonical",
            title="Quiz 17",
            chapters=["17"],
            description="Canonical screenshot set for the separate Chapter 17 quiz grouping used in this app.",
            source_dir=study_root / "screenshots" / "test-2-no-3",
            source_provenance=[
                str(study_root / "screenshots" / "test-2-no-3"),
                str(raw_root / "test 2 no 3"),
                str(raw_root / "drive-download-20260318T235336Z-3-001" / "test 2 no 3"),
            ],
            extraction_note="This set uses a manual visual transcription artifact because no machine OCR export was present with the source files.",
            note="The screenshot provenance is preserved as-is; the question catalog also records that the images themselves reference textbook figures labeled 16.x.",
        ),
        ScreenshotSource(
            id="study-guide",
            kind="study-guide",
            scope="supplemental",
            title="Study Guide",
            chapters=["15", "16"],
            description="Supplemental study-guide screenshots kept for reference but excluded from canonical formula coverage.",
            source_dir=study_root / "screenshots" / "test-2-study-guide",
            source_provenance=[
                str(study_root / "screenshots" / "test-2-study-guide"),
                str(raw_root / "Test 2 study guide"),
                str(raw_root / "Ch 15-16 screen shots"),
            ],
            note="These screenshots remain available for study support, but they do not count as canonical quiz coverage in the formula audit.",
        ),
    ]

    return file_sources, screenshot_sources


def write_manifest(project_root: Path, manifest: dict[str, Any]) -> None:
    output_path = project_root / "src" / "data" / "referenceLibrary.ts"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_json = json.dumps(manifest, indent=2)
    output_path.write_text(
        "export const referenceLibrary = " + manifest_json + " as const\n\n"
        + "export type ReferenceLibrary = typeof referenceLibrary\n"
        + "export type ReferenceSource = (typeof referenceLibrary.sources)[number]\n"
        + "export type ReferenceSourceId = ReferenceSource['id']\n",
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the canonical reference library and extracted artifacts for the app."
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repo root. Defaults to the parent of this script.",
    )
    parser.add_argument(
        "--study-root",
        type=Path,
        default=Path(r"C:\Users\Scott\OneDrive\Desktop\studyappupdate\reference-material"),
        help="Root directory containing the readable homework files, OCR export, and screenshot sets.",
    )
    parser.add_argument(
        "--raw-root",
        type=Path,
        default=Path(r"C:\Users\Scott\OneDrive\Desktop\Homeworks and Screenshots"),
        help="Root directory containing the raw exported folders preserved for provenance.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = args.project_root.resolve()
    study_root = args.study_root.resolve()
    raw_root = args.raw_root.resolve()

    if not study_root.exists():
        raise FileNotFoundError(f"Study root not found: {study_root}")
    if not raw_root.exists():
        raise FileNotFoundError(f"Raw root not found: {raw_root}")

    public_root = project_root / "public" / "reference-library"
    if public_root.exists():
        shutil.rmtree(public_root)
    public_root.mkdir(parents=True, exist_ok=True)

    extracted_root = public_root / "extracted"
    sources_root = public_root / "sources"

    file_sources, screenshot_sources = build_sources(study_root, raw_root)
    manifest_sources: list[dict[str, Any]] = []

    for source in file_sources:
        destination = sources_root / source.id / source.output_name
        public_path = copy_file(source.source_path, destination, public_root)
        item = file_item_manifest(source.source_path, public_path)

        if source.source_path.suffix.lower() == ".docx":
            paragraphs = read_docx_paragraphs(source.source_path)
            artifact_payload = {
                "sourceId": source.id,
                "parser": "docx",
                "paragraphCount": len(paragraphs),
                "paragraphs": paragraphs,
            }
        else:
            pages = read_pdf_pages(source.source_path)
            artifact_payload = {
                "sourceId": source.id,
                "parser": "pypdf",
                "pageCount": len(pages),
                "pages": pages,
            }

        artifact_path = extracted_root / f"{source.id}.json"
        write_json(artifact_path, artifact_payload)

        manifest_sources.append(
            {
                "id": source.id,
                "kind": source.kind,
                "scope": source.scope,
                "title": source.title,
                "chapters": source.chapters,
                "description": source.description,
                "itemCount": 1,
                "items": [item],
                "previewImagePaths": [],
                "sourceProvenance": source.source_provenance,
                "extractionArtifacts": [
                    {
                        "kind": artifact_payload["parser"],
                        "publicPath": "/" + artifact_path.relative_to(public_root.parent).as_posix(),
                    }
                ],
                "note": source.note,
            }
        )

    quiz_15_16_ocr_path = study_root / "ocr" / "test2no2.json"
    quiz_15_16_ocr = json.loads(quiz_15_16_ocr_path.read_text(encoding="utf-8"))
    quiz_17_manual_artifact = {
        "sourceId": "quiz-17",
        "parser": "manual-visual",
        "note": "Manual visual extraction from the canonical screenshot set. Figure labels in the images remain preserved as provenance even when they reference chapter 16.x textbook figures.",
        "questions": QUIZ_17_MANUAL_QUESTIONS,
    }

    for source in screenshot_sources:
        destination = sources_root / source.id
        public_paths = copy_directory(source.source_dir, destination, public_root)
        items = screenshot_items_manifest(source.source_dir, f"/reference-library/sources/{source.id}")

        artifacts: list[dict[str, Any]] = []
        if source.id == "quiz-15-16":
            artifact_path = extracted_root / "quiz-15-16-ocr.json"
            write_json(artifact_path, quiz_15_16_ocr)
            artifacts.append(
                {
                    "kind": "ocr",
                    "publicPath": "/" + artifact_path.relative_to(public_root.parent).as_posix(),
                }
            )
        elif source.id == "quiz-17":
            artifact_path = extracted_root / "quiz-17-manual.json"
            write_json(artifact_path, quiz_17_manual_artifact)
            artifacts.append(
                {
                    "kind": "manual-visual",
                    "publicPath": "/" + artifact_path.relative_to(public_root.parent).as_posix(),
                }
            )

        manifest_sources.append(
            {
                "id": source.id,
                "kind": source.kind,
                "scope": source.scope,
                "title": source.title,
                "chapters": source.chapters,
                "description": source.description,
                "itemCount": len(items),
                "items": items,
                "previewImagePaths": public_paths[:4],
                "sourceProvenance": source.source_provenance,
                "extractionArtifacts": artifacts,
                "extractionNote": source.extraction_note,
                "note": source.note,
            }
        )

    manifest_sources.sort(key=lambda source: (source["scope"] != "canonical", source["title"].lower()))

    homework_count = sum(1 for source in manifest_sources if source["kind"] == "homework")
    canonical_quiz_count = sum(
        source["itemCount"] for source in manifest_sources if source["kind"] == "quiz"
    )
    supplemental_image_count = sum(
        source["itemCount"] for source in manifest_sources if source["kind"] == "study-guide"
    )

    manifest = {
        "importedAt": "2026-03-18",
        "canonicalWorkspace": str(project_root),
        "stats": {
            "sourceCount": len(manifest_sources),
            "canonicalSourceCount": sum(1 for source in manifest_sources if source["scope"] == "canonical"),
            "supplementalSourceCount": sum(1 for source in manifest_sources if source["scope"] == "supplemental"),
            "homeworkDocumentCount": homework_count,
            "canonicalQuizImageCount": canonical_quiz_count,
            "supplementalImageCount": supplemental_image_count,
            "totalAssetCount": sum(source["itemCount"] for source in manifest_sources),
            "extractionArtifactCount": sum(len(source["extractionArtifacts"]) for source in manifest_sources),
        },
        "sources": manifest_sources,
    }

    write_manifest(project_root, manifest)
    print(json.dumps(manifest["stats"], indent=2))


if __name__ == "__main__":
    main()

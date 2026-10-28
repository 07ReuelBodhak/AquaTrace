import io
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

try:
    from backend.app.schemas.models import AnalysisResponse, Investigation
except ImportError:
    from app.schemas.models import AnalysisResponse, Investigation

def generate_pdf_report(
    investigation: Investigation,
    analysis: AnalysisResponse
) -> bytes:
    """
    Generates a deterministic, high-contrast, publication-grade Field Investigation Brief PDF.
    Reflects the exact analysis snapshot and data provenance without LLM hallucinations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom high-contrast styles matching theme
    # Ink: #111827, Slate: #374151, Mist: #F3F4F6
    c_ink = colors.HexColor("#111827")
    c_slate = colors.HexColor("#374151")
    c_mist = colors.HexColor("#F3F4F6")
    c_line = colors.HexColor("#9CA3AF")
    
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_ink,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=c_slate,
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=c_ink,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_ink
    )
    
    cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=c_ink
    )

    cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=cell_style,
        fontName="Helvetica-Bold"
    )

    elements = []

    # Title & Metadata
    elements.append(Paragraph("AQUATRACE FIELD INVESTIGATION BRIEF", title_style))
    elements.append(Paragraph(
        f"<b>Investigation:</b> {investigation.title} (ID: {investigation.investigation_id}) &nbsp;|&nbsp; "
        f"<b>Area:</b> {investigation.geographic_area} &nbsp;|&nbsp; "
        f"<b>Generated:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')}",
        subtitle_style
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=c_ink, spaceAfter=10))

    # Provenance and Dataset Cohort Summary
    timeline_note = f"Filtered by recorded_at <= {analysis.timeline_cutoff}" if analysis.is_timeline_filtered else "Full cumulative dataset"
    elements.append(Paragraph("1. Dataset Provenance & Cohort Metrics", h2_style))
    
    summary_data = [
        [
            Paragraph("<b>Dataset Version</b>", cell_bold),
            Paragraph(f"v{analysis.dataset_version}", cell_style),
            Paragraph("<b>Timeline Status</b>", cell_bold),
            Paragraph(timeline_note, cell_style)
        ],
        [
            Paragraph("<b>Eligible Records</b>", cell_bold),
            Paragraph(f"{analysis.eligible_records} of {analysis.total_records}", cell_style),
            Paragraph("<b>Case Breakdown</b>", cell_bold),
            Paragraph(f"Ill: {analysis.ill_count} &nbsp;|&nbsp; Not Ill: {analysis.not_ill_count} &nbsp;|&nbsp; Unknown: {analysis.unknown_illness_count}", cell_style)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[110, 150, 110, 160])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_mist),
        ('GRID', (0,0), (-1,-1), 0.5, c_line),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 10))

    # Candidate Water Source Comparison
    elements.append(Paragraph("2. Candidate Water Source Statistical Comparison", h2_style))
    
    headers = [
        Paragraph("<b>Candidate Source</b>", cell_bold),
        Paragraph("<b>Exposed AR<br/>(Ill / Denom)</b>", cell_bold),
        Paragraph("<b>Unexposed AR<br/>(Ill / Denom)</b>", cell_bold),
        Paragraph("<b>Relative Risk<br/>(95% CI)</b>", cell_bold),
        Paragraph("<b>Unknown Exp</b>", cell_bold),
        Paragraph("<b>Priority Status</b>", cell_bold)
    ]
    
    rows = [headers]
    for s in analysis.sources:
        rr_str = f"{s.relative_risk:.2f}" if s.relative_risk is not None else "N/A"
        if s.ci_calculable and s.confidence_interval_95:
            ci_str = f"({s.confidence_interval_95.lower:.2f} - {s.confidence_interval_95.upper:.2f})"
        else:
            ci_str = "(Unavailable)"
            
        rows.append([
            Paragraph(f"<b>{s.source_name}</b><br/><i>{s.source_type}</i>", cell_style),
            Paragraph(f"{s.exposed_attack_rate_pct or 'N/A'}", cell_style),
            Paragraph(f"{s.unexposed_attack_rate_pct or 'N/A'}", cell_style),
            Paragraph(f"<b>{rr_str}</b><br/>{ci_str}", cell_style),
            Paragraph(str(s.unknown_exposure_count), cell_style),
            Paragraph(f"<b>{s.candidate_priority.replace('_', ' ')}</b>", cell_style),
        ])
        
    t_sources = Table(rows, colWidths=[120, 95, 95, 85, 55, 80])
    t_sources.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_mist),
        ('GRID', (0,0), (-1,-1), 0.5, c_line),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_sources)
    elements.append(Spacer(1, 10))

    # Prioritization Rationale & Limitations
    elements.append(Paragraph("3. Epidemiological Evidence & Limitations Summary", h2_style))
    for s in analysis.sources:
        p_text = (
            f"<b>{s.source_name}:</b> {s.priority_reason} "
            f"<i>Data Sufficiency: {s.data_sufficiency}.</i>"
        )
        elements.append(Paragraph(p_text, body_style))
        if s.limitations:
            lim_text = f"&nbsp;&nbsp;&bull; <i>Limitations:</i> {'; '.join(s.limitations)}"
            elements.append(Paragraph(lim_text, body_style))
        elements.append(Spacer(1, 4))

    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=0.8, color=c_slate, spaceAfter=8))
    
    # Official Public Health Disclaimer
    disclaimer = (
        "<b>LEGAL & EPIDEMIOLOGICAL NOTICE:</b> AquaTrace is a decision-support and investigation-prioritisation system. "
        "Statistical association does NOT prove microbiological or chemical contamination. "
        "Prioritization indicates candidate sources for targeted sanitary surveys, bacteriological testing, and environmental water sampling. "
        "Clinical diagnosis and regulatory intervention must follow certified laboratory protocols."
    )
    elements.append(Paragraph(disclaimer, ParagraphStyle("Disclaimer", parent=body_style, fontSize=7.5, leading=10, textColor=c_slate)))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

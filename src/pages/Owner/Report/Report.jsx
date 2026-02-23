// src/components/ExportReport/ExportReport.jsx
import React, { useReducer, useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Report.module.css";

// ----- Report & format config (could also come from an API) -----

const REPORT_TYPES = [
    {
        id: "sales",
        title: "Sales Report",
        subtitle: "All transactions and revenue",
    },
    {
        id: "inventory",
        title: "Inventory Report",
        subtitle: "Current stock levels",
    },
    {
        id: "variance",
        title: "Variance Report",
        subtitle: "All variances and losses",
    },
    {
        id: "audit",
        title: "Audit Trail",
        subtitle: "All staff activities",
    },
];

const FILE_FORMATS = [
    { id: "csv", label: "CSV", subtitle: "Excel Compatible" },
    { id: "pdf", label: "PDF", subtitle: "Print Ready" },
    { id: "json", label: "JSON", subtitle: "Developer format" },
];

// ----- Reducer & initial state -----

const initialState = {
    selectedReportType: "sales",
    selectedFormat: "csv",
    // using strings; you can convert to Date objects as needed
    dateFrom: "",
    dateTo: "",
    quickRange: "14d", // "today" | "7d" | "30d" | "lastMonth" | custom string
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_REPORT_TYPE":
            return { ...state, selectedReportType: action.payload };
        case "SET_FORMAT":
            return { ...state, selectedFormat: action.payload };
        case "SET_DATE_FROM":
            return { ...state, dateFrom: action.payload, quickRange: "custom" };
        case "SET_DATE_TO":
            return { ...state, dateTo: action.payload, quickRange: "custom" };
        case "SET_QUICK_RANGE":
            return { ...state, quickRange: action.payload };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

// Utility: simulate computing preview stats from filters
function computePreviewSummary(state) {
    // Basic demo logic: pretend different report types & ranges
    // change totalTransactions and dateRangeLabel.
    let base = 287;
    let multiplier = 1;

    switch (state.selectedReportType) {
        case "sales":
            multiplier = 1.0;
            break;
        case "inventory":
            multiplier = 0.6;
            break;
        case "variance":
            multiplier = 0.4;
            break;
        case "audit":
            multiplier = 1.2;
            break;
        default:
            break;
    }

    let days = 14;
    if (state.quickRange === "today") days = 1;
    else if (state.quickRange === "7d") days = 7;
    else if (state.quickRange === "30d") days = 30;
    else if (state.quickRange === "lastMonth") days = 30;
    else if (state.quickRange === "custom") {
        days = 14; // placeholder; in real app, calculate from dateFrom/dateTo
    }

    const totalTransactions = Math.round(base * multiplier * (days / 14));
    const dateRangeLabel =
        state.quickRange === "custom" ? "Custom range" : `${days} days`;

    return { totalTransactions, dateRangeLabel };
}

const Report = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const [preview, setPreview] = useState({
        totalTransactions: 287,
        dateRangeLabel: "14 days",
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    // Memoized function to recalc preview
    const updatePreview = useCallback((s) => {
        const summary = computePreviewSummary(s);
        setPreview(summary);
    }, []);

    // Recalc preview whenever relevant state changes
    useEffect(() => {
        updatePreview(state);
    }, [state, updatePreview]);

    // Memoized submit handler (replace with real API/AI call)
    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setSubmitMessage("");

            // Here is where you would call your export API
            // and maybe get a download URL.
            try {
                // Fake delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                const selectedReport = REPORT_TYPES.find(
                    (r) => r.id === state.selectedReportType
                );
                const selectedFormat = FILE_FORMATS.find(
                    (f) => f.id === state.selectedFormat
                );

                setSubmitMessage(
                    `Generated ${selectedReport?.title || "Report"} as ${selectedFormat?.label || state.selectedFormat
                    }. (Stubbed response – plug in your API here.)`
                );
            } catch (err) {
                console.error(err);
                setSubmitMessage("There was an error generating the report.");
            } finally {
                setSubmitting(false);
            }
        },
        [state]
    );

    const handleCancel = () => {
        dispatch({ type: "RESET" });
        setSubmitMessage("");
    };

    const handleQuickRangeClick = (range) => {
        dispatch({ type: "SET_QUICK_RANGE", payload: range });
    };

    return (
        <div className={styles.page}>
            <Link to="/owner/dashboard" className={styles.backLinkLink} ><div className={styles.backLink}>{"< Back"}</div></Link>

            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Report</h1>
            </div>

            <div className={styles.card}>
                <div className={styles.reportHeader}>
                    <h2 className={styles.title}>Export Report</h2>
                    <p className={styles.subtitle}>
                        Download data for accounting and analysis
                    </p>
                </div>


                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Report type */}
                    <section className={styles.section}>
                        <div className={styles.sectionLabel}>Select Report Type</div>
                        <div className={styles.reportGrid}>
                            {REPORT_TYPES.map((report) => {
                                const isSelected =
                                    state.selectedReportType === report.id;
                                return (
                                    <button
                                        key={report.id}
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_REPORT_TYPE",
                                                payload: report.id,
                                            })
                                        }
                                        className={`${styles.reportCard} ${isSelected ? styles.reportCardSelected : ""
                                            }`}
                                    >
                                        <div
                                            className={`${styles.reportColorBlock} ${isSelected
                                                ? styles.reportColorSelected
                                                : styles.reportColorDefault
                                                }`}
                                        />
                                        <div className={styles.reportTextBlock}>
                                            <div className={styles.reportTitle}>
                                                {report.title}
                                            </div>
                                            <div className={styles.reportSubtitle}>
                                                {report.subtitle}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Date range */}
                    <section className={styles.section}>
                        <div className={styles.dataRangeSection}>
                            <div className={styles.sectionLabel}>Date Range</div>

                            <div className={styles.dateInputsRow}>
                                <div className={styles.dateField}>
                                    <label className={styles.inputLabel}>From</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={state.dateFrom}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "SET_DATE_FROM",
                                                payload: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className={styles.dateField}>
                                    <label className={styles.inputLabel}>To</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={state.dateTo}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "SET_DATE_TO",
                                                payload: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.quickRangeRow}>
                                <button
                                    type="button"
                                    onClick={() => handleQuickRangeClick("today")}
                                    className={`${styles.chipButton} ${state.quickRange === "today"
                                        ? styles.chipButtonActive
                                        : ""
                                        }`}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickRangeClick("7d")}
                                    className={`${styles.chipButton} ${state.quickRange === "7d"
                                        ? styles.chipButtonActive
                                        : ""
                                        }`}
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickRangeClick("30d")}
                                    className={`${styles.chipButton} ${state.quickRange === "30d"
                                        ? styles.chipButtonActive
                                        : ""
                                        }`}
                                >
                                    This Month
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickRangeClick("lastMonth")}
                                    className={`${styles.chipButton} ${state.quickRange === "lastMonth"
                                        ? styles.chipButtonActive
                                        : ""
                                        }`}
                                >
                                    Last Month
                                </button>
                            </div>
                        </div>

                    </section>

                    {/* File format */}
                    <section className={styles.section}>
                        <div className={styles.sectionLabel}>File Format</div>
                        <div className={styles.formatRow}>
                            {FILE_FORMATS.map((format) => {
                                const isSelected =
                                    state.selectedFormat === format.id;
                                return (
                                    <button
                                        key={format.id}
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_FORMAT",
                                                payload: format.id,
                                            })
                                        }
                                        className={`${styles.formatCard} ${isSelected ? styles.formatCardSelected : ""
                                            } ${format.id === "csv"
                                                ? styles.formatCSV
                                                : format.id === "pdf"
                                                    ? styles.formatPDF
                                                    : styles.formatJSON
                                            }`}
                                    >
                                        <div className={styles.formatLabel}>
                                            {format.label}
                                        </div>
                                        <div className={styles.formatSubtitle}>
                                            {format.subtitle}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Preview */}
                    <section className={styles.section}>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHead}>
                                Report Preview:
                            </div>

                            <div className={styles.previewLabel}>
                                <div>
                                    <div className={styles.previewMetaLabel}>
                                        Total Transactions
                                    </div>
                                    <div className={styles.previewMetaValue}>
                                        {preview.totalTransactions}
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.previewRight}>
                                        <div className={styles.previewMetaLabel}>
                                            Date Range
                                        </div>
                                        <div className={styles.previewMetaValue}>
                                            {preview.dateRangeLabel}
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </section>

                    {/* Actions */}
                    <div className={styles.actionsRow}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting}
                        >
                            {submitting
                                ? "Generating..."
                                : "Generate & Download"}
                        </button>
                    </div>

                    {submitMessage && (
                        <div className={styles.submitMessage}>
                            {submitMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Report;

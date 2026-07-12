package com.deopuri.api.dto;

import java.util.List;

/**
 * Summary of a bulk CSV product import.
 *
 * @param total    number of data rows read from the CSV (excluding the header)
 * @param imported number of products successfully created
 * @param skipped  number of rows skipped due to validation / parse errors
 * @param errors   human-readable reasons for each skipped row (e.g. "row 4: missing name")
 */
public record ProductImportResult(
        int total,
        int imported,
        int skipped,
        List<String> errors
) {
}

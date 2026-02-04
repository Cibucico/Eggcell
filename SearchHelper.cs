using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Text;
using System.Threading.Tasks;

namespace Egcell
{
    internal class SearchHelper
    {
        public static IEnumerable<DataRow> FilterRowsByKeyword(
        DataTable table,
        string keyword,
        List<string> columns = null)
        {
            if (table == null)
                throw new ArgumentNullException(nameof(table));

            // If keyword is null or whitespace, return all rows (no filtering)
            if (string.IsNullOrWhiteSpace(keyword))
                return table.AsEnumerable();

            // Determine columns to search
            List<string> columnsToSearch;
            if (columns == null || columns.Count == 0)
            {
                // All columns
                columnsToSearch = table.Columns
                    .Cast<DataColumn>()
                    .Select(col => col.ColumnName)
                    .ToList();
            }
            else
            {
                // Only columns that exist in the table
                columnsToSearch = columns
                    .Where(colName => table.Columns.Contains(colName))
                    .ToList();
            }
            if (columnsToSearch.Count == 0)
                return Enumerable.Empty<DataRow>();

            // Perform filtering
            string keywordToSearch = keyword.Trim();

            // Use StringComparison.OrdinalIgnoreCase for system-level, culture-agnostic matching
            return table.AsEnumerable().Where(row =>
                columnsToSearch.Any(colName =>
                {
                    // Skip null or DBNull values
                    if (row.IsNull(colName))
                        return false;

                    // Convert value to string
                    var valueObj = row[colName];
                    string valueStr = Convert.ToString(valueObj);

                    // Skip if value is null or empty
                    if (string.IsNullOrEmpty(valueStr))
                        return false;

                    // Case-insensitive partial match
                    return valueStr.IndexOf(keywordToSearch, StringComparison.OrdinalIgnoreCase) >= 0;
                })
            );
        }

    }
}
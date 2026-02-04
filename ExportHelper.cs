using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace Egcell
{
    internal class ExportHelper
    {
        public static void ExportToCsv(DataTable table, string filePath)
        {
            if (table == null || table.Rows.Count == 0)
                throw new ArgumentException("No data available to export.");

            var sb = new StringBuilder();

            // Write headers
            for (int i = 0; i < table.Columns.Count; i++)
            {
                sb.Append(table.Columns[i].ColumnName);
                if (i < table.Columns.Count - 1)
                    sb.Append(",");
            }
            sb.AppendLine();
            // Write rows
            foreach (DataRow row in table.Rows)
            {
                for (int i = 0; i < table.Columns.Count; i++)
                {
                    string value = row[i]?.ToString().Replace("\"", "\"\"");
                    sb.Append($"\"{value}\"");
                    if (i < table.Columns.Count - 1)
                        sb.Append(",");
                }
                sb.AppendLine();
            }

            File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);

        }
        public static void ExportToTxt(DataTable table, string filePath)
        {
            if (table == null || table.Rows.Count == 0)
                throw new ArgumentException("No data available to export.");

            var sb = new StringBuilder();

            // Write headers
            for (int i = 0; i < table.Columns.Count; i++)
            {
                sb.Append(table.Columns[i].ColumnName);
                if (i < table.Columns.Count - 1)
                    sb.Append("\t");
            }
            sb.AppendLine();

            // Write rows
            foreach (DataRow row in table.Rows)
            {
                for (int i = 0; i < table.Columns.Count; i++)
                {
                    sb.Append(row[i]?.ToString());
                    if (i < table.Columns.Count - 1)
                        sb.Append("\t");
                }
                sb.AppendLine();
            }

            File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
        }


    }
}
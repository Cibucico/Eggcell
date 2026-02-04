using Microsoft.VisualBasic;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlTypes;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    public partial class MainForm : Form
    {
        private string aliasFilePath = Path.Combine(Application.StartupPath, "HeaderAliases.json");
        private DataTable dataTable;
        private string currentFilePath; 
        public MainForm()
        {
            InitializeComponent();
            InitializeGrid();
            InitializeEvents();
            EnsureExcelFolder();
            SetupComboBoxStyling();


        }

        private void MainForm_Load(object sender, EventArgs e)
        {
            SetupArchiveContextMenu();
            EnsureExcelFolder();
            LoadGroupedDropdown();
            SelectMostRecentFile();
            SetupComboBoxStyling();
            cmbExcelFiles.SelectedIndexChanged += cmbExcelFiles_SelectedIndexChanged;
            RefreshFileList();

        }

        #region Grid Initialization

        private void InitializeGrid()
        {
            //dataTable = new DataTable();
            //dataGridView1.DataSource = dataTable;
            dataGridView1.AllowUserToAddRows = false;
            dataGridView1.AllowUserToDeleteRows = false;
            dataGridView1.EditMode = DataGridViewEditMode.EditOnEnter;
            dataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dataGridView1.MultiSelect = false;

            clbColumns.Visible = false;
        }
        private void UpdateHasFilesColumn()
        {
            foreach (DataGridViewRow row in dataGridView1.Rows)
            {
                string idValue = null;

                if (dataGridView1.Columns.Contains("ID"))
                {
                    idValue = row.Cells["ID"].Value?.ToString();
                }
                else
                {
                    if (row.DataBoundItem is DataRowView drv && drv.Row.Table.Columns.Contains("ID"))
                    {
                        idValue = drv.Row["ID"]?.ToString();
                    }
                }

                // ✅ Populate HasFiles column
                if (!string.IsNullOrWhiteSpace(idValue))
                {
                    var files = FileManager.GetFilesForID(idValue);
                    row.Cells["HasFiles"].Value = files.Length > 0 ? "Yes" : "No";
                }
                else
                {
                    row.Cells["HasFiles"].Value = "No";
                }
            }
        }

        #endregion

        #region Event Wiring

        private void InitializeEvents()
        {
            dataGridView1.CellClick += DataGridView1_CellClick;
            dataGridView1.CellBeginEdit += DataGridView1_CellBeginEdit;
            dataGridView1.CellContentClick += DataGridView1_CellContentClick;
            dataGridView1.CellDoubleClick += DataGridView1_CellDoubleClick;
            dataGridView1.KeyDown += DataGridView1_KeyDown;
            dataGridView1.CellMouseEnter += DataGridView1_CellMouseEnter;

            TipHelper.AttachTooltip(chkAllColumns, "Search across all columns at once.");
            TipHelper.AttachTooltip(clbColumns, "Select specific columns to search.");
            TipHelper.AttachTooltip(chkAge, "Filter results by age range.");
            TipHelper.AttachTooltip(chkRace, "Filter results by race.");
            TipHelper.AttachTooltip(chkGender, "Filter results by gender.");
            TipHelper.AttachTooltip(chkID, "Filter results by ID.");
        }

        #endregion

        #region Grid Events

        private void DataGridView1_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && dataGridView1.Columns[e.ColumnIndex].Name == "UploadButton")
            {
                var row = dataGridView1.Rows[e.RowIndex];
                if (!dataGridView1.Columns.Contains("ID"))
                    return;

                var idValue = row.Cells["ID"].Value?.ToString();

                using (OpenFileDialog openFileDialog = new OpenFileDialog())
                {
                    openFileDialog.Title = "Select file to upload";
                    if (openFileDialog.ShowDialog() == DialogResult.OK)
                    {
                        string filePath = openFileDialog.FileName;

                        if (!string.IsNullOrWhiteSpace(idValue))
                        {
                            FileManager.SaveFileToIDFolder(idValue, filePath);
                            MessageBox.Show($"File uploaded to ID folder: {idValue}", "Upload Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                        else
                        {
                            FileManager.SaveFileToGeneralFolder(filePath);
                            MessageBox.Show("No ID found. File uploaded to General folder.", "Upload Notice", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        }
                        UpdateHasFilesColumn();

                    }
                }
            }
        }
        private void DataGridView1_CellBeginEdit(object sender, DataGridViewCellCancelEventArgs e)
        {
            if (dataGridView1.Columns[e.ColumnIndex].Name == "ID")
            {
                var result = MessageBox.Show(
                    "Editing the ID will affect file associations. Are you sure you want to continue?",
                    "Warning",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning);

                if (result == DialogResult.No)
                {
                    e.Cancel = true;
                }
            }
        }
        private void DataGridView1_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0 || e.ColumnIndex < 0 || e.ColumnIndex >= dataGridView1.Columns.Count)
                return;

            var row = dataGridView1.Rows[e.RowIndex];
            var cellValue = row.Cells[e.ColumnIndex].Value?.ToString();


            if (!string.IsNullOrEmpty(cellValue))
            {
                Clipboard.SetText(cellValue);
                MessageBox.Show("Cell value copied to clipboard.", "Paste Helper",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            }

            var column = dataGridView1.Columns[e.ColumnIndex];
            if (column.Name == "HasFiles")
            {
                string idValue = null;

                // Try visible ID column first
                if (dataGridView1.Columns.Contains("ID"))
                {
                    idValue = row.Cells["ID"].Value?.ToString();
                }
                else
                {
                    // Fallback: pull ID from the bound DataRow
                    if (row.DataBoundItem is DataRowView drv && drv.Row.Table.Columns.Contains("ID"))
                    {
                        idValue = drv.Row["ID"]?.ToString();
                    }
                }

                if (!string.IsNullOrWhiteSpace(idValue))
                {
                    using (var manager = new UploadManager())
                    {
                        manager.ShowFilesForID(idValue);
                        manager.ShowDialog();
                    }
                }
                else
                {
                    MessageBox.Show("No ID available for this row.", "Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
        }
        private void DataGridView1_KeyDown(object sender, KeyEventArgs e) //select cell and press enter (email paste)
        {
            if (e.KeyCode == Keys.Enter && dataGridView1.CurrentCell != null)
            {
                var cellValue = dataGridView1.CurrentCell.Value?.ToString();
                if (!string.IsNullOrEmpty(cellValue))
                {
                    OutlookHelper.AppendToEmailBody(cellValue);
                    e.Handled = true; // prevent default Enter behavior
                }
            }
        }
        private ToolTip fileTooltip = new ToolTip();

        private void DataGridView1_CellMouseEnter(object sender, DataGridViewCellEventArgs e)
        {
            // ✅ Guard against invalid indexes (headers, out of range)
            if (e.RowIndex < 0 || e.ColumnIndex < 0 || e.ColumnIndex >= dataGridView1.Columns.Count)
            {
                fileTooltip.SetToolTip(dataGridView1, null);
                return;
            }

            // ✅ Only act when hovering over the HasFiles column
            if (dataGridView1.Columns[e.ColumnIndex].Name == "HasFiles")
            {
                var row = dataGridView1.Rows[e.RowIndex];

                string idValue = null;

                // ✅ First try to get ID from the visible cell (if column is shown)
                if (dataGridView1.Columns.Contains("ID"))
                {
                    idValue = row.Cells["ID"].Value?.ToString();
                }
                else
                {
                    // ✅ If ID column is hidden, pull it from the underlying DataRow
                    if (row.DataBoundItem is DataRowView drv && drv.Row.Table.Columns.Contains("ID"))
                    {
                        idValue = drv.Row["ID"]?.ToString();
                    }
                }

                // ✅ Tooltip logic
                if (!string.IsNullOrWhiteSpace(idValue))
                {
                    var files = FileManager.GetFilesForID(idValue);
                    if (files.Length > 0)
                    {
                        string fileList = string.Join(Environment.NewLine, files.Select(Path.GetFileName));
                        fileTooltip.SetToolTip(dataGridView1, fileList);
                    }
                    else
                    {
                        fileTooltip.SetToolTip(dataGridView1, "No files uploaded.");
                    }
                }
                else
                {
                    fileTooltip.SetToolTip(dataGridView1, "No ID assigned.");
                }
            }
            else
            {

                fileTooltip.SetToolTip(dataGridView1, null);
            }
        }
        private void DataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            if (dataGridView1.Columns[e.ColumnIndex].Name == "UploadButton" && e.RowIndex >= 0)
            {
                using (var ofd = new OpenFileDialog())
                {
                    ofd.Filter = "All files (*.*)|*.*";
                    if (ofd.ShowDialog() == DialogResult.OK)
                    {
                        string filePath = ofd.FileName;

                        // ✅ Get the row's ID from the grid
                        string rowId = dataGridView1.Rows[e.RowIndex].Cells["ID"].Value?.ToString();

                        if (!string.IsNullOrEmpty(rowId))
                        {
                            // ✅ Save file under this ID using FileManager
                            FileManager.SaveFileToIDFolder(rowId, filePath);

                            // ✅ Update HasFiles column based on FileManager
                            var files = FileManager.GetFilesForID(rowId);
                            dataGridView1.Rows[e.RowIndex].Cells["HasFiles"].Value =
                                files.Length > 0 ? "Yes" : "No";
                        }
                    }
                }
            }
        }

        #endregion

        #region Search and Filter
        private void btnSearch_Click(object sender, EventArgs e)
        {
            string keyword = txtKeyword.Text.Trim();
            bool searchAll = chkAllColumns.Checked;

            if (!searchAll && clbColumns.CheckedItems.Count == 0)
            {
                clbColumns.Items.Clear();
                foreach (DataColumn col in dataTable.Columns)
                {
                    clbColumns.Items.Add(col.ColumnName, false); // checked by default
                }

                clbColumns.Visible = true;
                clbColumns.BringToFront();
                clbColumns.Focus();

                TipHelper.Show("Please select at least one column to search.");
                return;
            }

            IEnumerable<DataRow> filteredRows = dataTable.AsEnumerable();

            // Keyword search
            if (!string.IsNullOrEmpty(keyword))
            {
                var selectedColumns = searchAll ? null : clbColumns.CheckedItems.Cast<string>().ToList();

                filteredRows = SearchHelper.FilterRowsByKeyword(dataTable, keyword, selectedColumns);

            }
            // Determine which filters are selected
            bool useAge = chkAge.Checked;
            bool useRace = chkRace.Checked;
            bool useGender = chkGender.Checked;
            bool useID = chkID.Checked;

            if (useAge || useRace || useGender || useID)
            {
                using (var dialog = new FilterDialog())
                {
                    dialog.ConfigureVisibleFilters(useAge, useRace, useGender, useID);

                    // Extract Race/Gender options fresh from the current dataTable
                    var raceOptions = dataTable.AsEnumerable()
                        .Select(r => r["Race"].ToString())
                        .Where(val => !string.IsNullOrWhiteSpace(val))
                        .Distinct()
                        .OrderBy(val => val)
                        .ToList();

                    var genderOptions = dataTable.AsEnumerable()
                        .Select(r => r["Gender"].ToString())
                        .Where(val => !string.IsNullOrWhiteSpace(val))
                        .Distinct()
                        .OrderBy(val => val)
                        .ToList();

                    dialog.SetDropdownOptions(raceOptions, genderOptions);

                    if (dialog.ShowDialog() == DialogResult.OK)
                    {
                        filteredRows = dialog.ApplyFilters(filteredRows);
                    }
                }
            }

            // ✅ Build a table with only selected columns
            var selectedCols = searchAll
                ? dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList()
                : clbColumns.CheckedItems.Cast<string>().ToList();

            DataTable resultTable = filteredRows.Any()
                ? BuildFilteredTable(filteredRows, selectedCols)
                : BuildFilteredTable(dataTable.AsEnumerable(), selectedCols);

            dataGridView1.DataSource = resultTable;

            // ✅ Always keep UploadButton and HasFiles
            EnsureCustomColumns();
            UpdateHasFilesColumn();
            clbColumns.Visible = false;
        }
        private void chkAllColumns_CheckedChanged(object sender, EventArgs e)
        {
            clbColumns.Enabled = !chkAllColumns.Checked;
        }


        #endregion

        #region Excel Data Loading
        private void LoadExcelData(string filePath)
        {
            // ✅ Set license before using ExcelPackage
            ExcelPackage.License.SetNonCommercialOrganization("<Forvis Mazars Institute of Development>");

            // Build DataTable only — no direct UI calls here
            var newTable = new DataTable();
            var aliases = LoadAliases();

            using (var package = new ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];
                bool hasHeader = true;

                // Build columns with alias normalization
                foreach (var firstRowCell in worksheet.Cells[1, 1, 1, worksheet.Dimension.End.Column])
                {
                    string header = hasHeader ? firstRowCell.Text : $"Column {firstRowCell.Start.Column}";
                    string normalized = aliases.ContainsKey(header) ? aliases[header] : header;

                    if (!newTable.Columns.Contains(normalized))
                        newTable.Columns.Add(normalized);
                }

                // Fill rows
                var startRow = hasHeader ? 2 : 1;
                for (int rowNum = startRow; rowNum <= worksheet.Dimension.End.Row; rowNum++)
                {
                    var wsRow = worksheet.Cells[rowNum, 1, rowNum, worksheet.Dimension.End.Column];
                    bool hasData = wsRow.Any(cell => !string.IsNullOrWhiteSpace(cell.Text));
                    if (!hasData) continue;

                    var row = newTable.NewRow();
                    foreach (var cell in wsRow)
                    {
                        int colIndex = cell.Start.Column - 1;
                        if (colIndex >= 0 && colIndex < newTable.Columns.Count)
                            row[colIndex] = cell.Text;
                    }
                    newTable.Rows.Add(row);
                }
            }

            // Replace global DataTable reference
            dataTable = newTable;

            // ✅ UI updates marshaled back to UI thread
            this.Invoke((Action)(() =>
            {
                dataGridView1.DataSource = dataTable;
                AddCheckboxColumn();
                SetupContextMenu();

                // Add Upload + HasFiles columns
                if (!dataGridView1.Columns.Contains("UploadButton"))
                {
                    var uploadButtonColumn = new DataGridViewButtonColumn
                    {
                        HeaderText = "Upload",
                        Text = "Upload File",
                        UseColumnTextForButtonValue = true,
                        Name = "UploadButton"
                    };
                    dataGridView1.Columns.Add(uploadButtonColumn);
                }

                if (!dataGridView1.Columns.Contains("HasFiles"))
                {
                    var hasFilesColumn = new DataGridViewTextBoxColumn
                    {
                        HeaderText = "📎 Files",
                        Name = "HasFiles",
                        ReadOnly = true,
                        Width = 60
                    };
                    dataGridView1.Columns.Add(hasFilesColumn);
                }

                RenumberRows();
                UpdateHasFilesColumn();
            }));
        }

        private void AddCheckboxColumn()
        {
            if (!dataGridView1.Columns.Contains("Select"))
            {
                DataGridViewCheckBoxColumn checkColumn = new DataGridViewCheckBoxColumn
                {
                    Name = "Select",
                    HeaderText = "✓",   
                    Width = 40,
                    ReadOnly = false
                };
                dataGridView1.Columns.Insert(0, checkColumn);

                // Handle header click for "Select All"
                dataGridView1.CellClick += (s, e) =>
                {
                    if (e.RowIndex == -1 && e.ColumnIndex == dataGridView1.Columns["Select"].Index)
                    {
                        bool selectAll = true;

                        // Check if at least one row is unchecked
                        foreach (DataGridViewRow row in dataGridView1.Rows)
                        {
                            if (row.Cells["Select"].Value is bool isChecked && isChecked)
                                continue;
                            else
                            {
                                selectAll = false;
                                break;
                            }
                        }

                        // Toggle all rows
                        foreach (DataGridViewRow row in dataGridView1.Rows)
                        {
                            row.Cells["Select"].Value = !selectAll;
                        }
                    }
                };
            }
        }
        private void SetupContextMenu()
        {
            ContextMenuStrip contextMenu = new ContextMenuStrip();
            ToolStripMenuItem deleteItem = new ToolStripMenuItem("Delete Row(s)");
            deleteItem.Click += (s, e) => PreviewDeleteSelectedOrCheckedRows(); // 🔧 use preview logic
            contextMenu.Items.Add(deleteItem);

            dataGridView1.ContextMenuStrip = contextMenu;

        }

        #endregion

        private void btnOpenExcel_Click(object sender, EventArgs e)
        {
            EnsureExcelFolder();

            using (OpenFileDialog ofd = new OpenFileDialog())
            {
                ofd.Filter = "Excel Files|*.xlsx;*.xls";
                if (ofd.ShowDialog() == DialogResult.OK)
                {
                    string sourcePath = ofd.FileName;
                    string destPath = Path.Combine(excelFolderPath, Path.GetFileName(sourcePath));

                    // Handle duplicates by appending timestamp
                    if (File.Exists(destPath))
                    {
                        string fileNameWithoutExt = Path.GetFileNameWithoutExtension(sourcePath);
                        string ext = Path.GetExtension(sourcePath);
                        string uniqueName = $"{fileNameWithoutExt}_{DateTime.Now:yyyyMMddHHmmss}{ext}";
                        destPath = Path.Combine(excelFolderPath, uniqueName);
                    }

                    // ✅ Copy into archive folder
                    File.Copy(sourcePath, destPath);

                    // ✅ Set current file path to archived copy
                    currentFilePath = destPath;

                    // ✅ Load into grid
                    LoadExcelData(currentFilePath);

                    // ✅ Refresh dropdown
                    LoadGroupedDropdown();
                }
            }
        }


        private DataTable BuildFilteredTable(IEnumerable<DataRow> rows, List<string> selectedColumns)
        {
            var newTable = new DataTable();

            // Add only selected columns
            foreach (var colName in selectedColumns)
            {
                if (rows.First().Table.Columns.Contains(colName))
                    newTable.Columns.Add(colName);
            }

            // Import rows
            foreach (var row in rows)
            {
                var newRow = newTable.NewRow();
                foreach (var colName in selectedColumns)
                {
                    newRow[colName] = row[colName];
                }
                newTable.Rows.Add(newRow);
            }

            return newTable;
        }
        private void EnsureCustomColumns()
        {
            if (!dataGridView1.Columns.Contains("UploadButton"))
            {
                var uploadButton = new DataGridViewButtonColumn
                {
                    Name = "UploadButton",
                    HeaderText = "Upload",
                    Text = "Upload",
                    UseColumnTextForButtonValue = true
                };
                dataGridView1.Columns.Add(uploadButton);
            }

            if (!dataGridView1.Columns.Contains("HasFiles"))
            {
                var hasFilesCol = new DataGridViewTextBoxColumn
                {
                    Name = "HasFiles",
                    HeaderText = "Has Files"
                };
                dataGridView1.Columns.Add(hasFilesCol);
            }
        }
        private List<string> GetExcelHeaders(string filePath)
        {
            using (var package = new ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];
                var headers = new List<string>();

                int colCount = worksheet.Dimension.End.Column;
                for (int col = 1; col <= colCount; col++)
                {
                    headers.Add(worksheet.Cells[1, col].Text);
                }

                return headers;
            }
        }
        private void SaveDataTableToExcel(DataTable table, string filePath)
        {
            using (var package = new OfficeOpenXml.ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets.FirstOrDefault()
                                ?? package.Workbook.Worksheets.Add("Sheet1");

                // Clear existing worksheet
                worksheet.Cells.Clear();

                // Load DataTable into worksheet (headers included)
                worksheet.Cells["A1"].LoadFromDataTable(table, true);

                package.Save();
            }
        }

        private void btnAddStudent_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(currentFilePath))
            {
                MessageBox.Show("Please open an Excel file first.");
                return;
            }

            // Collect headers directly from the grid
            var headers = new List<string>();
            foreach (DataGridViewColumn col in dataGridView1.Columns)
            {
                if (col.HeaderText == "✓" || col.HeaderText == "✔" ||
                    col.Name == "UploadButton" ||
                    col.Name == "HasFiles")
                    continue;

                headers.Add(col.HeaderText);
            }


            // Load aliases inline (merge defaults + user JSON)
            var aliases = new Dictionary<string, string>(defaultAliases, StringComparer.OrdinalIgnoreCase);
            if (File.Exists(aliasFilePath))
            {
                var userAliases = JsonConvert.DeserializeObject<Dictionary<string, string>>(
                    File.ReadAllText(aliasFilePath)
                );
                foreach (var kvp in userAliases)
                    aliases[kvp.Key] = kvp.Value;
            }

            // Pass aliases into the DataEntryForm
            using (var form = new DataEntryForm(headers, dataGridView1, aliases))
            {
                if (form.ShowDialog() == DialogResult.OK)
                {
                    var values = form.Values;

                    // Add new row to grid
                    int rowIndex = dataGridView1.Rows.Add();
                    foreach (var kvp in values)
                    {
                        if (dataGridView1.Columns.Contains(kvp.Key))
                            dataGridView1.Rows[rowIndex].Cells[kvp.Key].Value = kvp.Value;
                    }
                }
                RefreshFileList();

            }
        }

        private void PreviewDeleteSelectedOrCheckedRows()
        {
            if (dataGridView1.DataSource is DataTable dataTable)
            {
                List<DataRow> rowsToDelete = new List<DataRow>();

                // 1. Rows explicitly selected
                foreach (DataGridViewRow selectedRow in dataGridView1.SelectedRows)
                {
                    if (selectedRow.DataBoundItem is DataRowView rowView)
                        rowsToDelete.Add(rowView.Row);
                }

                // 2. Rows with checkbox ticked
                foreach (DataGridViewRow row in dataGridView1.Rows)
                {
                    if (row.Cells["Select"] is DataGridViewCheckBoxCell chkCell &&
                        chkCell.Value is bool isChecked && isChecked)
                    {
                        if (row.DataBoundItem is DataRowView rowView)
                            rowsToDelete.Add(rowView.Row);
                    }
                }

                if (rowsToDelete.Count == 0)
                {
                    MessageBox.Show("Please select or check at least one row to delete.");
                    return;
                }

                // Build a temporary preview table
                DataTable previewTable = dataTable.Clone(); // same schema
                foreach (var row in rowsToDelete)
                    previewTable.ImportRow(row);

                // Temporarily show only the rows to delete
                dataGridView1.DataSource = previewTable;

                var confirm = MessageBox.Show(
                    $"You are about to delete {rowsToDelete.Count} row(s). Do you want to proceed?",
                    "Confirm Delete",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning);

                if (confirm == DialogResult.Yes)
                {
                    foreach (var row in rowsToDelete)
                        dataTable.Rows.Remove(row);

                    SaveDataTableToExcel(dataTable, currentFilePath);
                    MessageBox.Show("Row(s) deleted and Excel file updated successfully.");
                }

                // Restore the full table view
                dataGridView1.DataSource = dataTable;
            }
        }
        private string excelFolderPath = Path.Combine(Application.StartupPath, "ExcelFiles");

        private void EnsureExcelFolder()
        {
            if (!Directory.Exists(excelFolderPath))
                Directory.CreateDirectory(excelFolderPath);
        }
        private void LoadGroupedDropdown()
        {
            string metadataPath = Path.Combine(Application.StartupPath, "ExcelMetadata.json");
            Dictionary<string, FileUsage> usageData = new Dictionary<string, FileUsage>();

            if (File.Exists(metadataPath))
                usageData = JsonConvert.DeserializeObject<Dictionary<string, FileUsage>>(File.ReadAllText(metadataPath));

            var allFiles = Directory.GetFiles(excelFolderPath, "*.xls*")
                                    .Select(f => Path.GetFileName(f))
                                    .ToList();

            // Most Used (top 3 by UsageCount)
            var mostUsed = usageData.OrderByDescending(u => u.Value.UsageCount)
                                    .Select(u => u.Key)
                                    .Where(f => allFiles.Contains(f))
                                    .Take(3)
                                    .ToList();

            // Recently Used (top 3 by LastUsed, excluding Most Used)
            var recent = usageData.OrderByDescending(u => u.Value.LastUsed)
                                  .Select(u => u.Key)
                                  .Where(f => allFiles.Contains(f) && !mostUsed.Contains(f))
                                  .Take(3)
                                  .ToList();

            cmbExcelFiles.Items.Clear();
            cmbExcelFiles.Items.Add("=== Recently Used ===");
            foreach (var f in recent) cmbExcelFiles.Items.Add(f);

            cmbExcelFiles.Items.Add("---"); // separator
            cmbExcelFiles.Items.Add("=== Most Used ===");
            foreach (var f in mostUsed) cmbExcelFiles.Items.Add(f);

            cmbExcelFiles.Items.Add("---"); // separator
            cmbExcelFiles.Items.Add("=== All Files ===");
            foreach (var f in allFiles) cmbExcelFiles.Items.Add(f);
        }

        private async void cmbExcelFiles_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cmbExcelFiles.SelectedItem == null) return;

            string selected = cmbExcelFiles.SelectedItem.ToString();
            if (selected.StartsWith("===") || selected == "---") return;

            string fullPath = Path.Combine(excelFolderPath, selected);
            currentFilePath = fullPath;

            try
            {
                Cursor = Cursors.WaitCursor;
                await Task.Run(() => LoadExcelData(currentFilePath));
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error opening file '{selected}': {ex.Message}",
                    "File Loader", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                Cursor = Cursors.Default;
            }
        }

        private void RefreshFileList()
        {
            // Just call your existing method
            cmbExcelFiles.BeginUpdate();
            LoadGroupedDropdown();
            cmbExcelFiles.EndUpdate();
        }

        private void SetupArchiveContextMenu()
        {
            ContextMenuStrip contextMenu = new ContextMenuStrip();
            ToolStripMenuItem deleteItem = new ToolStripMenuItem("Delete from Archive");
            deleteItem.Click += (s, e) => DeleteSelectedArchiveFile();
            contextMenu.Items.Add(deleteItem);

            cmbExcelFiles.ContextMenuStrip = contextMenu;
        }
        private void DeleteSelectedArchiveFile()
        {
            if (cmbExcelFiles.SelectedItem == null)
            {
                MessageBox.Show("Please select a file from the dropdown to delete.");
                return;
            }

            string selectedFile = cmbExcelFiles.SelectedItem.ToString();
            string fullPath = Path.Combine(excelFolderPath, selectedFile);

            if (!File.Exists(fullPath))
            {
                MessageBox.Show("File not found in archive.");
                return;
            }

            var confirm = MessageBox.Show(
                $"Are you sure you want to delete '{selectedFile}' from the archive?",
                "Confirm Delete",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning);

            if (confirm == DialogResult.Yes)
            {
                try
                {
                    File.Delete(fullPath);
                    MessageBox.Show("File deleted from archive successfully.");

                    // Refresh dropdown
                    LoadGroupedDropdown();

                    // Clear grid if the deleted file was currently loaded
                    if (currentFilePath == fullPath)
                    {
                        dataGridView1.DataSource = null;
                        currentFilePath = null;
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error deleting file: {ex.Message}");
                }
            }
        }
        private void SetupComboBoxStyling()
        {
            cmbExcelFiles.DrawMode = DrawMode.OwnerDrawFixed;
            cmbExcelFiles.DrawItem += cmbExcelFiles_DrawItem;
        }
        private void cmbExcelFiles_DrawItem(object sender, DrawItemEventArgs e)
        {
            if (e.Index < 0) return;
            string text = cmbExcelFiles.Items[e.Index].ToString();

            e.DrawBackground();

            if (text == "---")
            {
                using (Pen pen = new Pen(Color.LightGray))
                {
                    e.Graphics.DrawLine(pen, e.Bounds.Left, e.Bounds.Top + e.Bounds.Height / 2,
                                             e.Bounds.Right, e.Bounds.Top + e.Bounds.Height / 2);
                }
            }
            else if (text.StartsWith("==="))
            {
                using (Font headerFont = new Font(e.Font, FontStyle.Bold))
                using (Brush headerBrush = new SolidBrush(Color.Gray))
                {
                    e.Graphics.DrawString(text, headerFont, headerBrush, e.Bounds);
                }
            }
            else
            {
                using (Brush itemBrush = new SolidBrush(e.ForeColor))
                {
                    e.Graphics.DrawString(text, e.Font, itemBrush, e.Bounds);
                }
            }

            e.DrawFocusRectangle();
        }
        public class FileUsage
        {
            public int UsageCount { get; set; } = 0;
            public DateTime LastUsed { get; set; } = DateTime.MinValue;
        }
        private void UpdateFileUsage(string fileName)
        {
            string metadataPath = Path.Combine(Application.StartupPath, "ExcelMetadata.json");
            Dictionary<string, FileUsage> usageData;

            if (File.Exists(metadataPath))
            {
                usageData = JsonConvert.DeserializeObject<Dictionary<string, FileUsage>>(File.ReadAllText(metadataPath));
            }
            else
            {
                usageData = new Dictionary<string, FileUsage>();
            }

            if (!usageData.ContainsKey(fileName))
                usageData[fileName] = new FileUsage();

            usageData[fileName].UsageCount++;
            usageData[fileName].LastUsed = DateTime.Now;

            File.WriteAllText(metadataPath, JsonConvert.SerializeObject(usageData, Formatting.Indented));
        }
        private void SelectMostRecentFile()
        {
            string metadataPath = Path.Combine(Application.StartupPath, "ExcelMetadata.json");
            if (!File.Exists(metadataPath)) return;

            var usageData = JsonConvert.DeserializeObject<Dictionary<string, FileUsage>>(File.ReadAllText(metadataPath));
            if (usageData == null || usageData.Count == 0) return;

            // Find most recent file
            var mostRecent = usageData.OrderByDescending(u => u.Value.LastUsed)
                                      .Select(u => u.Key)
                                      .FirstOrDefault();

            if (mostRecent == null) return;

            string fullPath = Path.Combine(excelFolderPath, mostRecent);
            if (!File.Exists(fullPath)) return;

            // Select in ComboBox
            int index = cmbExcelFiles.Items.IndexOf(mostRecent);
            if (index >= 0)
            {
                cmbExcelFiles.SelectedIndex = index;
                currentFilePath = fullPath;
                LoadExcelData(currentFilePath);
            }
        }
        private Dictionary<string, string> defaultAliases = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
             // Row counter aliases
             { "No.", "No." },
            { "Number", "No." },
            { "RowID", "No." },
            { "Index", "No." },

            // Identifier aliases
            { "ID", "ID" },
            { "StudentID", "ID" },
            { "LearnerID", "ID" },
            { "Identifier", "ID" },

            // Other examples
            { "Sex", "Gender" },
            { "Race/Ethnicity", "Race" }
        };
        private Dictionary<string, string> LoadAliases()
        {
            var aliases = new Dictionary<string, string>(defaultAliases, StringComparer.OrdinalIgnoreCase);

            if (File.Exists(aliasFilePath))
            {
                var userAliases = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(aliasFilePath));
                foreach (var kvp in userAliases)
                    aliases[kvp.Key] = kvp.Value;
            }

            return aliases;
        }
        private void RenumberRows()
        {
            if (!dataTable.Columns.Contains("No.")) return;

            for (int i = 0; i < dataTable.Rows.Count; i++)
                dataTable.Rows[i]["No."] = i + 1;
        }

        private void AddAliasItem_Click(object sender, EventArgs e)
        {
            string originalHeader = dataGridView1.Columns[dataGridView1.CurrentCell.ColumnIndex].HeaderText;

            string alias = PromptForAlias(originalHeader);

            if (!string.IsNullOrWhiteSpace(alias))
            {
                Dictionary<string, string> userAliases = new Dictionary<string, string>();

                if (File.Exists(aliasFilePath))
                    userAliases = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(aliasFilePath));

                userAliases[originalHeader] = alias;

                File.WriteAllText(aliasFilePath, JsonConvert.SerializeObject(userAliases, Formatting.Indented));
            }
        }
        public string PromptForAlias(string header)
        {
            Form prompt = new Form()
            {
                Width = 400,
                Height = 150,
                Text = "Add Header Alias"
            };

            Label textLabel = new Label() { Left = 20, Top = 20, Text = $"Enter alias for '{header}':" };
            TextBox inputBox = new TextBox() { Left = 20, Top = 50, Width = 340 };
            Button confirmation = new Button() { Text = "OK", Left = 280, Width = 80, Top = 80, DialogResult = DialogResult.OK };

            prompt.Controls.Add(textLabel);
            prompt.Controls.Add(inputBox);
            prompt.Controls.Add(confirmation);
            prompt.AcceptButton = confirmation;

            return prompt.ShowDialog() == DialogResult.OK ? inputBox.Text : string.Empty;
        }

    }
}
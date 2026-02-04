using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    public partial class DataEntryForm : Form
    {
        private readonly List<string> _headers;
        private readonly DataGridView _grid;
        private readonly Dictionary<string, string> _aliases;

        public Dictionary<string, string> Values { get; private set; } = new Dictionary<string, string>();

        public DataEntryForm(List<string> headers, DataGridView grid, Dictionary<string, string> aliases)
        {
            InitializeComponent();

            panelContainer.Dock = DockStyle.Fill;
            panelContainer.AutoScroll = true;

            tableLayoutPanelFields.Dock = DockStyle.Top;
            tableLayoutPanelFields.AutoSize = true;
            tableLayoutPanelFields.AutoSizeMode = AutoSizeMode.GrowAndShrink;

            _headers = headers;
            _grid = grid;
            _aliases = aliases;

            BuildInputs();
            btnSave.Click += OnSaveClicked;
            btnCancel.Click += (s, e) => DialogResult = DialogResult.Cancel;
        }

        private void BuildInputs()
        {
            tableLayoutPanelFields.ColumnStyles.Clear();
            tableLayoutPanelFields.ColumnCount = 2;
            tableLayoutPanelFields.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 35));
            tableLayoutPanelFields.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 65));

            foreach (var header in _headers)
            {
                string normalized = _aliases.ContainsKey(header) ? _aliases[header] : header;

                var label = new Label
                {
                    Text = normalized,
                    AutoSize = true,
                    Anchor = AnchorStyles.Left | AnchorStyles.Right,
                    Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                    Padding = new Padding(4, 6, 4, 6),
                    Margin = new Padding(2)
                };

                Control inputControl;

                // Special rules
                if (string.Equals(normalized, "Person with disability Y/N", StringComparison.OrdinalIgnoreCase))
                {
                    var combo = new ComboBox
                    {
                        DropDownStyle = ComboBoxStyle.DropDownList,
                        Name = $"input_{header}",
                        Anchor = AnchorStyles.Left | AnchorStyles.Right
                    };
                    combo.Items.AddRange(new[] { "Y", "N" });
                    inputControl = combo;
                }
                else if (string.Equals(normalized, "ID", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(normalized, "Age", StringComparison.OrdinalIgnoreCase))
                {
                    var txt = new TextBox
                    {
                        Name = $"input_{header}",
                        Anchor = AnchorStyles.Left | AnchorStyles.Right
                    };
                    txt.KeyPress += (s, e) =>
                    {
                        if (!char.IsControl(e.KeyChar) && !char.IsDigit(e.KeyChar))
                            e.Handled = true;
                    };
                    inputControl = txt;
                }
                else if (string.Equals(normalized, "Contact details", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(normalized, "Alternative contact details", StringComparison.OrdinalIgnoreCase))
                {
                    var txt = new TextBox
                    {
                        Name = $"input_{header}",
                        Anchor = AnchorStyles.Left | AnchorStyles.Right
                    };
                    txt.KeyPress += (s, e) =>
                    {
                        if (!char.IsControl(e.KeyChar) && !char.IsDigit(e.KeyChar))
                            e.Handled = true;
                    };
                    inputControl = txt;
                }
                else if (string.Equals(normalized, "Start date", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(normalized, "End date", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(normalized, "DOB", StringComparison.OrdinalIgnoreCase))
                {
                    var dtp = new DateTimePicker
                    {
                        Name = $"input_{header}",
                        Format = DateTimePickerFormat.Short,
                        Anchor = AnchorStyles.Left | AnchorStyles.Right
                    };
                    inputControl = dtp;
                }
                else
                {
                    var txt = new TextBox
                    {
                        Name = $"input_{header}",
                        Anchor = AnchorStyles.Left | AnchorStyles.Right
                    };

                    // Auto-fill sequential number for "No"
                    if (normalized.Equals("No", StringComparison.OrdinalIgnoreCase))
                    {
                        int maxNumber = 0;
                        foreach (DataGridViewRow row in _grid.Rows)
                        {
                            var cellObj = row.Cells["No"]?.Value;
                            if (cellObj != null && int.TryParse(cellObj.ToString(), out int num))
                            {
                                if (num > maxNumber) maxNumber = num;
                            }
                        }

                        txt.Text = (maxNumber + 1).ToString();
                        txt.ReadOnly = true;
                    }

                    inputControl = txt;
                }

                int rowIndex = tableLayoutPanelFields.RowCount++;
                tableLayoutPanelFields.RowStyles.Add(new RowStyle(SizeType.AutoSize));
                tableLayoutPanelFields.Controls.Add(label, 0, rowIndex);
                tableLayoutPanelFields.Controls.Add(inputControl, 1, rowIndex);
            }
        }

        private void OnSaveClicked(object sender, EventArgs e)
        {
            foreach (var header in _headers)
            {
                var ctrl = tableLayoutPanelFields.Controls.Find($"input_{header}", true).FirstOrDefault();

                if (ctrl is TextBox textBox)
                {
                    if (string.IsNullOrWhiteSpace(textBox.Text))
                    {
                        MessageBox.Show($"Please fill in {header}.", "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        textBox.Focus();
                        return;
                    }

                    if (header.Equals("ID", StringComparison.OrdinalIgnoreCase))
                    {
                        var newId = textBox.Text.Trim();
                        foreach (DataGridViewRow row in _grid.Rows)
                        {
                            var existingId = row.Cells["ID"]?.Value?.ToString();
                            if (!string.IsNullOrEmpty(existingId) &&
                                existingId.Equals(newId, StringComparison.OrdinalIgnoreCase))
                            {
                                MessageBox.Show($"The ID '{newId}' already exists. Please enter a unique ID.",
                                    "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                                textBox.Focus();
                                return;
                            }
                        }
                    }
                }
                else if (ctrl is ComboBox comboBox)
                {
                    if (comboBox.SelectedIndex < 0)
                    {
                        MessageBox.Show($"Please select {header}.", "Validation", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        comboBox.Focus();
                        return;
                    }
                }
            }

            Values.Clear();
            foreach (var header in _headers)
            {
                var ctrl = tableLayoutPanelFields.Controls.Find($"input_{header}", true).FirstOrDefault();

                if (ctrl is TextBox textBox)
                    Values[header] = textBox.Text.Trim();
                else if (ctrl is ComboBox comboBox)
                    Values[header] = comboBox.SelectedItem?.ToString() ?? string.Empty;
                else if (ctrl is DateTimePicker dtp)
                    Values[header] = dtp.Value.ToShortDateString();
            }

            DialogResult = DialogResult.OK;
        }

        private void DataEntryForm_Load(object sender, EventArgs e)
        {

        }
    }
}

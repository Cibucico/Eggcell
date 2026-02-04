using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    public partial class FilterDialog : Form
    {
        public string IDFilter { get; private set; }
        public int? AgeMin { get; private set; }
        public int? AgeMax { get; private set; }
        public string SelectedRace { get; private set; }
        public string SelectedGender { get; private set; }


        public FilterDialog()
        {
            InitializeComponent();
        }
        public void ConfigureVisibleFilters(bool showAge, bool showRace, bool showGender, bool showID)
        {
            lblAgeMin.Visible = txtAgeMin.Visible = lblAgeMax.Visible = txtAgeMax.Visible = showAge;
            lblRace.Visible = cmbRace.Visible = showRace;
            lblGender.Visible = cmbGender.Visible = showGender;
            lblID.Visible = txtID.Visible = showID;

        }
        public void SetDropdownOptions(List<string> raceOptions, List<string> genderOptions)
        {
            cmbRace.Items.Clear();
            cmbRace.Items.AddRange(raceOptions.Distinct().OrderBy(x => x).ToArray());

            cmbGender.Items.Clear();
            cmbGender.Items.AddRange(genderOptions.Distinct().OrderBy(x => x).ToArray());
        }

        private void btnOK_Click(object sender, EventArgs e)
        {
            IDFilter = txtID.Visible ? txtID.Text.Trim() : null;

            if (txtAgeMin.Visible && int.TryParse(txtAgeMin.Text.Trim(), out int min))
                AgeMin = min;
            else
                AgeMin = null;

            if (txtAgeMax.Visible && int.TryParse(txtAgeMax.Text.Trim(), out int max))
                AgeMax = max;
            else
                AgeMax = null;

            SelectedRace = cmbRace.Visible && cmbRace.SelectedItem != null ? cmbRace.SelectedItem.ToString() : null;
            SelectedGender = cmbGender.Visible && cmbGender.SelectedItem != null ? cmbGender.SelectedItem.ToString() : null;

            DialogResult = DialogResult.OK;
            Close();
        }
        public IEnumerable<DataRow> ApplyFilters(IEnumerable<DataRow> rows)
        {
            if (!string.IsNullOrEmpty(IDFilter))
                rows = rows.Where(r => r["ID"].ToString().Equals(IDFilter, StringComparison.OrdinalIgnoreCase));

            if (AgeMin.HasValue)
                rows = rows.Where(r => int.TryParse(r["Age"].ToString(), out int age) && age >= AgeMin.Value);

            if (AgeMax.HasValue)
                rows = rows.Where(r => int.TryParse(r["Age"].ToString(), out int age) && age <= AgeMax.Value);

            if (!string.IsNullOrEmpty(SelectedRace))
                rows = rows.Where(r => r["Race"].ToString().Equals(SelectedRace, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(SelectedGender))
                rows = rows.Where(r => r["Gender"].ToString().Equals(SelectedGender, StringComparison.OrdinalIgnoreCase));

            return rows;
        }

    }
}

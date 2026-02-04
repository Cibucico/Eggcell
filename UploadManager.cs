using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    public partial class UploadManager : Form
    {
        private string currentID;

        #region Initialization

        public UploadManager()
        {
            InitializeComponent();
        }
        public void ShowFilesForID(string id)
        {
            currentID = id;
            lblCurrentID.Text = $"Files for ID: {id}";

            lstFiles.Items.Clear();

            var files = FileManager.GetFilesForID(id);
            foreach (var file in files)
            {
                lstFiles.Items.Add(Path.GetFileName(file));
            }
        }
        #endregion

        #region Button Events
        private void btnOpen_Click(object sender, EventArgs e)
        {
            var filePath = GetSelectedFilePath();
            if (filePath != null && File.Exists(filePath))
            {
                try
                {
                    Process.Start(new ProcessStartInfo(filePath) { UseShellExecute = true });
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error opening file: {ex.Message}", "Upload Manager",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

        }

        private void btnDelete_Click(object sender, EventArgs e)
        {
            var filePath = GetSelectedFilePath();
            if (filePath != null && File.Exists(filePath))
            {
                var confirm = MessageBox.Show($"Delete {Path.GetFileName(filePath)}?",
                    "Confirm Delete", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);

                if (confirm == DialogResult.Yes)
                {
                    try
                    {
                        File.Delete(filePath);
                        ShowFilesForID(currentID); // refresh list
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Error deleting file: {ex.Message}", "Upload Manager",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }

        }

        private void btnAttach_Click(object sender, EventArgs e)
        {
            var filePath = GetSelectedFilePath();
            if (filePath != null && File.Exists(filePath))
            {
                try
                {
                    OutlookHelper.AddAttachment(filePath);
                    MessageBox.Show($"{Path.GetFileName(filePath)} attached to email.", "Upload Manager",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error attaching file: {ex.Message}", "Upload Manager",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

        }
        #endregion

        #region Helpers
        private string GetSelectedFilePath()
        {
            if (lstFiles.SelectedItem == null)
            {
                MessageBox.Show("Please select a file first.", "Upload Manager",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return null;
            }

            string fileName = lstFiles.SelectedItem.ToString();
            string idDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Uploads", currentID);
            return Path.Combine(idDirectory, fileName);
        }

        #endregion
    }

}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    internal class PasteHelper
    {
        public static void CopyCellToClipboard(DataGridView grid)
        {
            if (grid.CurrentCell != null && grid.CurrentCell.Value != null)
            {
                Clipboard.SetText(grid.CurrentCell.Value.ToString());
                MessageBox.Show("Cell value copied to clipboard.", "Paste Helper",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                MessageBox.Show("No cell selected or empty value.", "Paste Helper",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }
        public static void CopyCellToKeywordBox(DataGridView grid, TextBox keywordBox)
        {
            if (grid.CurrentCell != null && grid.CurrentCell.Value != null)
            {
                keywordBox.Text = grid.CurrentCell.Value.ToString();
            }
            else
            {
                MessageBox.Show("No cell selected or empty value.", "Paste Helper",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }
    }

}
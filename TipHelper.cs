using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Egcell
{
    internal class TipHelper
    {
        public static void Show(string message)
        {
            MessageBox.Show(message, "Tip", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        public static void AttachTooltip(Control control, string message)
        {
            ToolTip tip = new ToolTip
            {
                AutoPopDelay = 5000,
                InitialDelay = 500,
                ReshowDelay = 200,
                ShowAlways = true
            };
            tip.SetToolTip(control, message);
        }

    }
}

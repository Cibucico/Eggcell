namespace Egcell
{
    partial class FilterDialog
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.btnOK = new System.Windows.Forms.Button();
            this.lblAgeMin = new System.Windows.Forms.Label();
            this.lblAgeMax = new System.Windows.Forms.Label();
            this.lblRace = new System.Windows.Forms.Label();
            this.lblGender = new System.Windows.Forms.Label();
            this.txtAgeMin = new System.Windows.Forms.TextBox();
            this.txtAgeMax = new System.Windows.Forms.TextBox();
            this.cmbRace = new System.Windows.Forms.ComboBox();
            this.cmbGender = new System.Windows.Forms.ComboBox();
            this.lblID = new System.Windows.Forms.Label();
            this.txtID = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // btnOK
            // 
            this.btnOK.Location = new System.Drawing.Point(304, 384);
            this.btnOK.Name = "btnOK";
            this.btnOK.Size = new System.Drawing.Size(135, 54);
            this.btnOK.TabIndex = 0;
            this.btnOK.Text = "Ok";
            this.btnOK.UseVisualStyleBackColor = true;
            this.btnOK.Click += new System.EventHandler(this.btnOK_Click);
            // 
            // lblAgeMin
            // 
            this.lblAgeMin.AutoSize = true;
            this.lblAgeMin.Location = new System.Drawing.Point(104, 35);
            this.lblAgeMin.Name = "lblAgeMin";
            this.lblAgeMin.Size = new System.Drawing.Size(56, 16);
            this.lblAgeMin.TabIndex = 1;
            this.lblAgeMin.Text = "Age Min";
            // 
            // lblAgeMax
            // 
            this.lblAgeMax.AutoSize = true;
            this.lblAgeMax.Location = new System.Drawing.Point(257, 35);
            this.lblAgeMax.Name = "lblAgeMax";
            this.lblAgeMax.Size = new System.Drawing.Size(60, 16);
            this.lblAgeMax.TabIndex = 2;
            this.lblAgeMax.Text = "Age Max";
            // 
            // lblRace
            // 
            this.lblRace.AutoSize = true;
            this.lblRace.Location = new System.Drawing.Point(24, 132);
            this.lblRace.Name = "lblRace";
            this.lblRace.Size = new System.Drawing.Size(40, 16);
            this.lblRace.TabIndex = 3;
            this.lblRace.Text = "Race";
            // 
            // lblGender
            // 
            this.lblGender.AutoSize = true;
            this.lblGender.Location = new System.Drawing.Point(12, 179);
            this.lblGender.Name = "lblGender";
            this.lblGender.Size = new System.Drawing.Size(52, 16);
            this.lblGender.TabIndex = 4;
            this.lblGender.Text = "Gender";
            // 
            // txtAgeMin
            // 
            this.txtAgeMin.Location = new System.Drawing.Point(84, 67);
            this.txtAgeMin.Name = "txtAgeMin";
            this.txtAgeMin.Size = new System.Drawing.Size(100, 22);
            this.txtAgeMin.TabIndex = 5;
            // 
            // txtAgeMax
            // 
            this.txtAgeMax.Location = new System.Drawing.Point(247, 67);
            this.txtAgeMax.Name = "txtAgeMax";
            this.txtAgeMax.Size = new System.Drawing.Size(100, 22);
            this.txtAgeMax.TabIndex = 6;
            // 
            // cmbRace
            // 
            this.cmbRace.FormattingEnabled = true;
            this.cmbRace.Location = new System.Drawing.Point(84, 124);
            this.cmbRace.Name = "cmbRace";
            this.cmbRace.Size = new System.Drawing.Size(121, 24);
            this.cmbRace.TabIndex = 7;
            // 
            // cmbGender
            // 
            this.cmbGender.FormattingEnabled = true;
            this.cmbGender.Location = new System.Drawing.Point(84, 179);
            this.cmbGender.Name = "cmbGender";
            this.cmbGender.Size = new System.Drawing.Size(121, 24);
            this.cmbGender.TabIndex = 8;
            // 
            // lblID
            // 
            this.lblID.AutoSize = true;
            this.lblID.Location = new System.Drawing.Point(20, 225);
            this.lblID.Name = "lblID";
            this.lblID.Size = new System.Drawing.Size(20, 16);
            this.lblID.TabIndex = 9;
            this.lblID.Text = "ID";
            // 
            // txtID
            // 
            this.txtID.Location = new System.Drawing.Point(84, 222);
            this.txtID.Name = "txtID";
            this.txtID.Size = new System.Drawing.Size(100, 22);
            this.txtID.TabIndex = 10;
            // 
            // FilterDialog
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.txtID);
            this.Controls.Add(this.lblID);
            this.Controls.Add(this.cmbGender);
            this.Controls.Add(this.cmbRace);
            this.Controls.Add(this.txtAgeMax);
            this.Controls.Add(this.txtAgeMin);
            this.Controls.Add(this.lblGender);
            this.Controls.Add(this.lblRace);
            this.Controls.Add(this.lblAgeMax);
            this.Controls.Add(this.lblAgeMin);
            this.Controls.Add(this.btnOK);
            this.Name = "FilterDialog";
            this.Text = "FilterDialog";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnOK;
        private System.Windows.Forms.Label lblAgeMin;
        private System.Windows.Forms.Label lblAgeMax;
        private System.Windows.Forms.Label lblRace;
        private System.Windows.Forms.Label lblGender;
        private System.Windows.Forms.TextBox txtAgeMin;
        private System.Windows.Forms.TextBox txtAgeMax;
        private System.Windows.Forms.ComboBox cmbRace;
        private System.Windows.Forms.ComboBox cmbGender;
        private System.Windows.Forms.Label lblID;
        private System.Windows.Forms.TextBox txtID;
    }
}
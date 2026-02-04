namespace Egcell
{
    partial class MainForm
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            this.txtKeyword = new System.Windows.Forms.TextBox();
            this.btnSearch = new System.Windows.Forms.Button();
            this.dataGridView1 = new System.Windows.Forms.DataGridView();
            this.chkAllColumns = new System.Windows.Forms.CheckBox();
            this.clbColumns = new System.Windows.Forms.CheckedListBox();
            this.label1 = new System.Windows.Forms.Label();
            this.chkAge = new System.Windows.Forms.CheckBox();
            this.chkRace = new System.Windows.Forms.CheckBox();
            this.chkGender = new System.Windows.Forms.CheckBox();
            this.chkID = new System.Windows.Forms.CheckBox();
            this.btnOpenExcel = new System.Windows.Forms.Button();
            this.btnAddStudent = new System.Windows.Forms.Button();
            this.cmbExcelFiles = new System.Windows.Forms.ComboBox();
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).BeginInit();
            this.SuspendLayout();
            // 
            // txtKeyword
            // 
            this.txtKeyword.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtKeyword.Location = new System.Drawing.Point(21, 4);
            this.txtKeyword.Name = "txtKeyword";
            this.txtKeyword.Size = new System.Drawing.Size(672, 22);
            this.txtKeyword.TabIndex = 0;
            // 
            // btnSearch
            // 
            this.btnSearch.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btnSearch.AutoSize = true;
            this.btnSearch.Location = new System.Drawing.Point(713, 0);
            this.btnSearch.Name = "btnSearch";
            this.btnSearch.Size = new System.Drawing.Size(75, 30);
            this.btnSearch.TabIndex = 1;
            this.btnSearch.Text = "Search";
            this.btnSearch.UseVisualStyleBackColor = true;
            this.btnSearch.Click += new System.EventHandler(this.btnSearch_Click);
            // 
            // dataGridView1
            // 
            this.dataGridView1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.dataGridView1.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dataGridView1.Location = new System.Drawing.Point(-1, 141);
            this.dataGridView1.Name = "dataGridView1";
            this.dataGridView1.RowHeadersWidth = 51;
            this.dataGridView1.RowTemplate.Height = 24;
            this.dataGridView1.Size = new System.Drawing.Size(803, 310);
            this.dataGridView1.TabIndex = 2;
            // 
            // chkAllColumns
            // 
            this.chkAllColumns.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.chkAllColumns.AutoSize = true;
            this.chkAllColumns.Location = new System.Drawing.Point(-1, 115);
            this.chkAllColumns.Name = "chkAllColumns";
            this.chkAllColumns.Size = new System.Drawing.Size(99, 20);
            this.chkAllColumns.TabIndex = 3;
            this.chkAllColumns.Text = "All Columns";
            this.chkAllColumns.UseVisualStyleBackColor = true;
            // 
            // clbColumns
            // 
            this.clbColumns.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.clbColumns.FormattingEnabled = true;
            this.clbColumns.Location = new System.Drawing.Point(1, 141);
            this.clbColumns.Name = "clbColumns";
            this.clbColumns.Size = new System.Drawing.Size(801, 310);
            this.clbColumns.TabIndex = 4;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 29);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(43, 16);
            this.label1.TabIndex = 5;
            this.label1.Text = "Filters";
            // 
            // chkAge
            // 
            this.chkAge.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.chkAge.AutoSize = true;
            this.chkAge.Location = new System.Drawing.Point(1, 78);
            this.chkAge.Name = "chkAge";
            this.chkAge.Size = new System.Drawing.Size(54, 20);
            this.chkAge.TabIndex = 6;
            this.chkAge.Text = "Age";
            this.chkAge.UseVisualStyleBackColor = true;
            // 
            // chkRace
            // 
            this.chkRace.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.chkRace.AutoSize = true;
            this.chkRace.Location = new System.Drawing.Point(75, 78);
            this.chkRace.Name = "chkRace";
            this.chkRace.Size = new System.Drawing.Size(62, 20);
            this.chkRace.TabIndex = 7;
            this.chkRace.Text = "Race";
            this.chkRace.UseVisualStyleBackColor = true;
            // 
            // chkGender
            // 
            this.chkGender.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.chkGender.AutoSize = true;
            this.chkGender.Location = new System.Drawing.Point(143, 78);
            this.chkGender.Name = "chkGender";
            this.chkGender.Size = new System.Drawing.Size(74, 20);
            this.chkGender.TabIndex = 8;
            this.chkGender.Text = "Gender";
            this.chkGender.UseVisualStyleBackColor = true;
            // 
            // chkID
            // 
            this.chkID.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.chkID.AutoSize = true;
            this.chkID.Location = new System.Drawing.Point(223, 78);
            this.chkID.Name = "chkID";
            this.chkID.Size = new System.Drawing.Size(42, 20);
            this.chkID.TabIndex = 9;
            this.chkID.Text = "ID";
            this.chkID.UseVisualStyleBackColor = true;
            // 
            // btnOpenExcel
            // 
            this.btnOpenExcel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btnOpenExcel.AutoSize = true;
            this.btnOpenExcel.Location = new System.Drawing.Point(687, 78);
            this.btnOpenExcel.Name = "btnOpenExcel";
            this.btnOpenExcel.Size = new System.Drawing.Size(101, 41);
            this.btnOpenExcel.TabIndex = 10;
            this.btnOpenExcel.Text = "Upload Excell";
            this.btnOpenExcel.UseVisualStyleBackColor = true;
            this.btnOpenExcel.Click += new System.EventHandler(this.btnOpenExcel_Click);
            // 
            // btnAddStudent
            // 
            this.btnAddStudent.Location = new System.Drawing.Point(119, 115);
            this.btnAddStudent.Name = "btnAddStudent";
            this.btnAddStudent.Size = new System.Drawing.Size(75, 23);
            this.btnAddStudent.TabIndex = 11;
            this.btnAddStudent.Text = "Add Student";
            this.btnAddStudent.UseVisualStyleBackColor = true;
            this.btnAddStudent.Click += new System.EventHandler(this.btnAddStudent_Click);
            // 
            // cmbExcelFiles
            // 
            this.cmbExcelFiles.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cmbExcelFiles.DrawMode = System.Windows.Forms.DrawMode.OwnerDrawFixed;
            this.cmbExcelFiles.FormattingEnabled = true;
            this.cmbExcelFiles.Location = new System.Drawing.Point(634, 48);
            this.cmbExcelFiles.Name = "cmbExcelFiles";
            this.cmbExcelFiles.Size = new System.Drawing.Size(154, 23);
            this.cmbExcelFiles.TabIndex = 13;
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoSize = true;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.cmbExcelFiles);
            this.Controls.Add(this.btnAddStudent);
            this.Controls.Add(this.btnOpenExcel);
            this.Controls.Add(this.chkID);
            this.Controls.Add(this.chkGender);
            this.Controls.Add(this.chkRace);
            this.Controls.Add(this.chkAge);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.clbColumns);
            this.Controls.Add(this.chkAllColumns);
            this.Controls.Add(this.dataGridView1);
            this.Controls.Add(this.btnSearch);
            this.Controls.Add(this.txtKeyword);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "MainForm";
            this.Text = "Eggcell";
            this.Load += new System.EventHandler(this.MainForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox txtKeyword;
        private System.Windows.Forms.Button btnSearch;
        private System.Windows.Forms.DataGridView dataGridView1;
        private System.Windows.Forms.CheckBox chkAllColumns;
        private System.Windows.Forms.CheckedListBox clbColumns;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.CheckBox chkAge;
        private System.Windows.Forms.CheckBox chkRace;
        private System.Windows.Forms.CheckBox chkGender;
        private System.Windows.Forms.CheckBox chkID;
        private System.Windows.Forms.Button btnOpenExcel;
        private System.Windows.Forms.Button btnAddStudent;
        private System.Windows.Forms.ComboBox cmbExcelFiles;
    }
}


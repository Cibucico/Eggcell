namespace Egcell
{
    partial class UploadManager
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
            this.btnOpen = new System.Windows.Forms.Button();
            this.btnDelete = new System.Windows.Forms.Button();
            this.btnAttach = new System.Windows.Forms.Button();
            this.lblCurrentID = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.lstFiles = new System.Windows.Forms.ListBox();
            this.SuspendLayout();
            // 
            // btnOpen
            // 
            this.btnOpen.Location = new System.Drawing.Point(632, 82);
            this.btnOpen.Name = "btnOpen";
            this.btnOpen.Size = new System.Drawing.Size(144, 48);
            this.btnOpen.TabIndex = 0;
            this.btnOpen.Text = "Open File";
            this.btnOpen.UseVisualStyleBackColor = true;
            this.btnOpen.Click += new System.EventHandler(this.btnOpen_Click);
            // 
            // btnDelete
            // 
            this.btnDelete.Location = new System.Drawing.Point(632, 136);
            this.btnDelete.Name = "btnDelete";
            this.btnDelete.Size = new System.Drawing.Size(141, 48);
            this.btnDelete.TabIndex = 1;
            this.btnDelete.Text = "Delete File";
            this.btnDelete.UseVisualStyleBackColor = true;
            this.btnDelete.Click += new System.EventHandler(this.btnDelete_Click);
            // 
            // btnAttach
            // 
            this.btnAttach.Location = new System.Drawing.Point(632, 200);
            this.btnAttach.Name = "btnAttach";
            this.btnAttach.Size = new System.Drawing.Size(144, 53);
            this.btnAttach.TabIndex = 2;
            this.btnAttach.Text = "Attach To Mail";
            this.btnAttach.UseVisualStyleBackColor = true;
            this.btnAttach.Click += new System.EventHandler(this.btnAttach_Click);
            // 
            // lblCurrentID
            // 
            this.lblCurrentID.AutoSize = true;
            this.lblCurrentID.Location = new System.Drawing.Point(12, 18);
            this.lblCurrentID.Name = "lblCurrentID";
            this.lblCurrentID.Size = new System.Drawing.Size(65, 16);
            this.lblCurrentID.TabIndex = 3;
            this.lblCurrentID.Text = "Current ID";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 53);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(36, 16);
            this.label2.TabIndex = 4;
            this.label2.Text = "Files";
            // 
            // lstFiles
            // 
            this.lstFiles.FormattingEnabled = true;
            this.lstFiles.ItemHeight = 16;
            this.lstFiles.Location = new System.Drawing.Point(15, 72);
            this.lstFiles.Name = "lstFiles";
            this.lstFiles.Size = new System.Drawing.Size(586, 372);
            this.lstFiles.TabIndex = 5;
            // 
            // UploadManager
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.lstFiles);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.lblCurrentID);
            this.Controls.Add(this.btnAttach);
            this.Controls.Add(this.btnDelete);
            this.Controls.Add(this.btnOpen);
            this.Name = "UploadManager";
            this.Text = "UploadManager";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnOpen;
        private System.Windows.Forms.Button btnDelete;
        private System.Windows.Forms.Button btnAttach;
        private System.Windows.Forms.Label lblCurrentID;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ListBox lstFiles;
    }
}
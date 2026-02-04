using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Outlook = Microsoft.Office.Interop.Outlook;


namespace Egcell
{
    internal class OutlookHelper
    {
        private static Outlook.Application outlookApp;
        private static Outlook.MailItem currentMail;

        public static void CreateNewEmail()
        {
            outlookApp = new Outlook.Application();
            currentMail = (Outlook.MailItem)outlookApp.CreateItem(Outlook.OlItemType.olMailItem);
        }
        public static void AppendToEmailBody(string text)
        {
            if (currentMail == null)
                CreateNewEmail();

            currentMail.Body += text + Environment.NewLine;
        }
        public static void AddAttachment(string filePath)
        {
            if (currentMail == null)
                CreateNewEmail();

            currentMail.Attachments.Add(filePath, Outlook.OlAttachmentType.olByValue, Type.Missing, Type.Missing);
        }
        public static void ShowEmail()
        {
            if (currentMail != null)
                currentMail.Display();
        }
        public static void SendEmail()
        {
            if (currentMail != null)
                currentMail.Send();
        }

    }
}

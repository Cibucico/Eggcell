using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace Egcell
{
    internal class FileManager
    {
        private static readonly string BaseDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Uploads");
        private static readonly string GeneralDirectory = Path.Combine(BaseDirectory, "General");

        static FileManager()
        {
            // Ensure base directories exist
            if (!Directory.Exists(BaseDirectory))
                Directory.CreateDirectory(BaseDirectory);

            if (!Directory.Exists(GeneralDirectory))
                Directory.CreateDirectory(GeneralDirectory);
        }

        public static void SaveFileToGeneralFolder(string filePath)
        {
            string fileName = Path.GetFileName(filePath);
            string destinationPath = Path.Combine(GeneralDirectory, fileName);

            File.Copy(filePath, destinationPath, true);
        }

        public static void SaveFileToIDFolder(string id, string filePath)
        {
            string idDirectory = Path.Combine(BaseDirectory, id);

            if (!Directory.Exists(idDirectory))
                Directory.CreateDirectory(idDirectory);

            string fileName = Path.GetFileName(filePath);
            string destinationPath = Path.Combine(idDirectory, fileName);

            File.Copy(filePath, destinationPath, true);
        }
        public static string[] GetFilesForID(string id)
        {
            string idDirectory = Path.Combine(BaseDirectory, id);

            if (Directory.Exists(idDirectory))
                return Directory.GetFiles(idDirectory);

            return Array.Empty<string>();
        }
        public static string[] GetGeneralFiles()
        {
            if (Directory.Exists(GeneralDirectory))
                return Directory.GetFiles(GeneralDirectory);

            return Array.Empty<string>();
        }

    }
}

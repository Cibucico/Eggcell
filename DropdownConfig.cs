using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using System.IO;

namespace Egcell
{
    internal class DropdownConfig
    {
        public static Dictionary<string, List<string>> Options { get; private set; }

        static DropdownConfig()
        {
            Options = LoadDropdownOptions("DropdownOptions.json");
        }

        private static Dictionary<string, List<string>> LoadDropdownOptions(string path)
        {
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<Dictionary<string, List<string>>>(json)
                   ?? new Dictionary<string, List<string>>();
        }

        // Call this after admin edits to refresh options
        public static void Reload(string path = "DropdownOptions.json")
        {
            Options = LoadDropdownOptions(path);
        }

    }
}

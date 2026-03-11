const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  // File extensions to include
  includeExtensions: [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".php",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".xml",
    ".yaml",
    ".yml",
    ".env.example",
    ".sql",
    ".sh",
    ".bash",
    ".zsh",
    ".dockerfile",
    ".gitignore",
  ],

  // Directories to skip
  ignoreDirs: [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    ".cache",
    "vendor",
    "__pycache__",
    ".vscode",
    ".idea",
    "tmp",
    "temp",
    "logs",
    ".DS_Store",
  ],

  // Files to skip
  ignoreFiles: [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".env",
    ".env.local",
    ".env.production",
    "*.log",
    "*.sqlite",
    "*.db",
    "*.min.js",
    "*.min.css",
  ],

  // Maximum file size in MB (skip files larger than this)
  maxFileSizeMB: 10,

  // Output configuration
  outputFileName: "collected-code.txt",
  includeTOC: true, // Include table of contents
  includeStats: true, // Include statistics at the end
  separatorStyle: "=", // Character for file separators
  separatorLength: 80,
};

class CodeCollector {
  constructor(targetDir) {
    this.targetDir = path.resolve(targetDir);
    this.files = [];
    this.stats = {
      totalFiles: 0,
      totalLines: 0,
      totalSize: 0,
      filesByExtension: {},
      skippedFiles: 0,
      errors: [],
    };
  }

  // Check if file should be included based on extension
  shouldIncludeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // Check if file matches ignore patterns
    for (const pattern of config.ignoreFiles) {
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace("*", ".*"));
        if (regex.test(fileName)) return false;
      } else if (fileName === pattern) {
        return false;
      }
    }

    // Check if extension is in include list
    return config.includeExtensions.includes(ext);
  }

  // Check if directory should be scanned
  shouldScanDir(dirName) {
    return !config.ignoreDirs.includes(dirName);
  }

  // Get file size in MB
  getFileSizeMB(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size / (1024 * 1024);
  }

  // Count lines in a file
  countLines(content) {
    return content.split("\n").length;
  }

  // Create separator line
  createSeparator() {
    return config.separatorStyle.repeat(config.separatorLength);
  }

  // Scan directory recursively
  scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (this.shouldScanDir(item)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          if (this.shouldIncludeFile(fullPath)) {
            const sizeMB = this.getFileSizeMB(fullPath);

            if (sizeMB <= config.maxFileSizeMB) {
              const relativePath = path.relative(this.targetDir, fullPath);
              this.files.push({
                path: relativePath,
                fullPath: fullPath,
                size: stat.size,
                extension: path.extname(fullPath).toLowerCase(),
              });
            } else {
              this.stats.skippedFiles++;
              console.log(
                `Skipped large file: ${fullPath} (${sizeMB.toFixed(2)}MB)`
              );
            }
          }
        }
      }
    } catch (error) {
      this.stats.errors.push(`Error scanning ${dir}: ${error.message}`);
    }
  }

  // Generate table of contents
  generateTOC() {
    let toc = "TABLE OF CONTENTS\n";
    toc += this.createSeparator() + "\n\n";

    // Group files by directory
    const filesByDir = {};

    for (const file of this.files) {
      const dir = path.dirname(file.path);
      if (!filesByDir[dir]) {
        filesByDir[dir] = [];
      }
      filesByDir[dir].push(file);
    }

    // Sort directories and files
    const sortedDirs = Object.keys(filesByDir).sort();

    for (const dir of sortedDirs) {
      toc += `📁 ${dir === "." ? "Root" : dir}\n`;
      const sortedFiles = filesByDir[dir].sort((a, b) =>
        a.path.localeCompare(b.path)
      );

      for (const file of sortedFiles) {
        toc += `  📄 ${path.basename(file.path)}\n`;
      }
      toc += "\n";
    }

    return toc;
  }

  // Generate statistics
  generateStats() {
    let stats = "\n\nSTATISTICS\n";
    stats += this.createSeparator() + "\n";
    stats += `Total files collected: ${this.stats.totalFiles}\n`;
    stats += `Total lines of code: ${this.stats.totalLines.toLocaleString()}\n`;
    stats += `Total size: ${(this.stats.totalSize / 1024 / 1024).toFixed(
      2
    )} MB\n`;
    stats += `Files skipped (too large): ${this.stats.skippedFiles}\n`;

    if (this.stats.errors.length > 0) {
      stats += `\nErrors encountered: ${this.stats.errors.length}\n`;
      this.stats.errors.forEach((error) => {
        stats += `  - ${error}\n`;
      });
    }

    stats += "\nFiles by extension:\n";
    const sortedExtensions = Object.entries(this.stats.filesByExtension).sort(
      (a, b) => b[1] - a[1]
    );

    for (const [ext, count] of sortedExtensions) {
      stats += `  ${ext}: ${count} files\n`;
    }

    return stats;
  }

  // Collect all code
  async collect() {
    console.log(`Starting code collection from: ${this.targetDir}\n`);

    // Check if directory exists
    if (!fs.existsSync(this.targetDir)) {
      console.error(`Error: Directory "${this.targetDir}" does not exist.`);
      process.exit(1);
    }

    // Scan directory
    console.log("Scanning directory structure...");
    this.scanDirectory(this.targetDir);

    // Sort files by path
    this.files.sort((a, b) => a.path.localeCompare(b.path));

    console.log(`Found ${this.files.length} files to collect.\n`);

    // Create output file
    const outputPath = path.join(process.cwd(), config.outputFileName);
    const writeStream = fs.createWriteStream(outputPath);

    // Write header
    writeStream.write(`Code Collection Report\n`);
    writeStream.write(`Generated: ${new Date().toISOString()}\n`);
    writeStream.write(`Source Directory: ${this.targetDir}\n`);
    writeStream.write(`${this.createSeparator()}\n\n`);

    // Write table of contents if enabled
    if (config.includeTOC && this.files.length > 0) {
      writeStream.write(this.generateTOC());
      writeStream.write(`\n${this.createSeparator()}\n\n`);
    }

    // Process each file
    for (const [index, file] of this.files.entries()) {
      try {
        console.log(
          `Processing (${index + 1}/${this.files.length}): ${file.path}`
        );

        const content = fs.readFileSync(file.fullPath, "utf-8");
        const lineCount = this.countLines(content);

        // Update statistics
        this.stats.totalFiles++;
        this.stats.totalLines += lineCount;
        this.stats.totalSize += file.size;

        if (!this.stats.filesByExtension[file.extension]) {
          this.stats.filesByExtension[file.extension] = 0;
        }
        this.stats.filesByExtension[file.extension]++;

        // Write file header
        writeStream.write(`\n${this.createSeparator()}\n`);
        writeStream.write(`FILE: ${file.path}\n`);
        writeStream.write(
          `Lines: ${lineCount} | Size: ${(file.size / 1024).toFixed(2)} KB\n`
        );
        writeStream.write(`${this.createSeparator()}\n\n`);

        // Write file content
        writeStream.write(content);

        // Add spacing between files
        writeStream.write("\n\n");
      } catch (error) {
        console.error(`Error reading file ${file.path}: ${error.message}`);
        this.stats.errors.push(`${file.path}: ${error.message}`);
      }
    }

    // Write statistics if enabled
    if (config.includeStats) {
      writeStream.write(this.generateStats());
    }

    // Close stream
    writeStream.end();

    console.log(`\n✅ Code collection complete!`);
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(
      `📊 Collected ${
        this.stats.totalFiles
      } files (${this.stats.totalLines.toLocaleString()} lines)`
    );
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node collect-code.js <directory>");
    console.log("Example: node collect-code.js app");
    console.log("         node collect-code.js .");
    console.log("         node collect-code.js /path/to/project");
    process.exit(1);
  }

  const targetDirectory = args[0];
  const collector = new CodeCollector(targetDirectory);

  collector.collect().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

// Run the script
main();

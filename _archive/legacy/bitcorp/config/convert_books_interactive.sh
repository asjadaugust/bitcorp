#!/bin/bash

# PDF to HTML Converter Script - Batch Mode
# Converts PDF files in the books folder to HTML format one by one

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOKS_DIR="$(dirname "$SCRIPT_DIR")/books"

echo -e "${BLUE}📚 PDF to HTML Converter - Batch Mode${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Books directory: ${YELLOW}$BOOKS_DIR${NC}"
echo ""

# Check if books directory exists
if [ ! -d "$BOOKS_DIR" ]; then
    echo -e "${RED}❌ Error: Books directory not found at $BOOKS_DIR${NC}"
    exit 1
fi

# Check if pdftohtml is installed
if ! command -v pdftohtml &> /dev/null; then
    echo -e "${RED}❌ Error: pdftohtml not found. Install it with:${NC}"
    echo -e "${YELLOW}brew install poppler${NC}"
    exit 1
fi

# Change to books directory
cd "$BOOKS_DIR"

# Count PDF files
pdf_count=$(find . -maxdepth 1 -name "*.pdf" | wc -l | tr -d ' ')
echo -e "Found ${YELLOW}$pdf_count${NC} PDF files to convert"
echo ""

# Auto-convert all PDFs - no user interaction needed
echo -e "${GREEN}🚀 Starting automatic conversion of all PDFs...${NC}"
echo -e "${BLUE}📁 Each book will be converted to its own folder${NC}"
echo ""

# Initialize counters
converted=0
failed=0
skipped=0

# Function to convert a single PDF
convert_pdf() {
    local pdf_file="$1"
    echo -e "${BLUE}📖 Converting:${NC} $pdf_file"
    
    # Generate folder name (remove .pdf extension and clean up)
    folder_name="${pdf_file%.pdf}"
    folder_name=$(echo "$folder_name" | tr ' ' '_' | tr -d '()[]{}')
    
    # Create folder for this book
    if [ -d "$folder_name" ]; then
        echo -e "${YELLOW}⚠️  Folder already exists: $folder_name${NC}"
        echo -e "   ${YELLOW}🗑️  Cleaning existing folder...${NC}"
        rm -rf "$folder_name"
    fi
    
    mkdir -p "$folder_name"
    echo -e "   ${GREEN}📁 Created folder: $folder_name${NC}"
    
    # Show progress
    echo -e "   ${YELLOW}⏳ Processing... (this may take a while for large PDFs)${NC}"
    
    # Convert PDF to HTML in the book's folder
    cd "$folder_name"
    if pdftohtml -c -noframes -zoom 1.5 "../$pdf_file" > /dev/null 2>&1; then
        # Check if HTML file was created
        base_name="${pdf_file%.pdf}"
        generated_html="${base_name}.html"
        
        if [ -f "$generated_html" ]; then
            echo -e "   ${GREEN}✅ Success:${NC} $generated_html"
            
            # Count generated image files
            img_count=$(ls "${base_name}"*.png 2>/dev/null | wc -l | tr -d ' ')
            if [ $img_count -gt 0 ]; then
                echo -e "   ${BLUE}📸 Generated $img_count page images${NC}"
            fi
            
            # Create a simple index.html for easier access
            cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>$base_name</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .link { padding: 10px; background: #f0f0f0; border-radius: 5px; margin: 10px 0; }
        a { text-decoration: none; color: #0066cc; font-weight: bold; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 $base_name</h1>
        <p>Book converted from PDF to HTML</p>
    </div>
    <div class="link">
        <a href="$generated_html">📖 Open Book (HTML)</a>
    </div>
    <div class="link">
        <a href="../$pdf_file">📄 Original PDF</a>
    </div>
</body>
</html>
EOF
            echo -e "   ${BLUE}📄 Created index.html for easy access${NC}"
            
            ((converted++))
        else
            echo -e "   ${RED}❌ Failed: HTML file not created${NC}"
            ((failed++))
        fi
    else
        echo -e "   ${RED}❌ Failed to convert:${NC} $pdf_file"
        ((failed++))
    fi
    
    # Go back to books directory
    cd "$BOOKS_DIR"
    echo ""
}

# Convert all PDFs automatically
echo -e "${BLUE}🔄 Processing PDFs...${NC}"
echo ""

for pdf_file in *.pdf; do
    if [ -f "$pdf_file" ]; then
        convert_pdf "$pdf_file"
    fi
done

# Summary
echo -e "${BLUE}📊 Conversion Summary${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${GREEN}✅ Successfully converted: $converted files${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ Failed conversions: $failed files${NC}"
fi
echo -e "${YELLOW}📁 Total PDF files: $pdf_count${NC}"
echo ""

# List generated folders and HTML files
folder_count=$(find . -maxdepth 1 -type d -name "*" ! -name "." | wc -l | tr -d ' ')
if [ $folder_count -gt 0 ]; then
    echo -e "${GREEN}� Generated book folders:${NC}"
    for folder in */; do
        if [ -d "$folder" ]; then
            folder_name="${folder%/}"
            if [ -f "$folder/index.html" ]; then
                echo -e "   ${GREEN}•${NC} $folder_name/ ${BLUE}(with index.html)${NC}"
            else
                echo -e "   ${YELLOW}•${NC} $folder_name/ ${RED}(no index.html)${NC}"
            fi
        fi
    done
    echo ""
    
    echo -e "${BLUE}💡 How to view the books:${NC}"
    echo -e "   • Navigate to any book folder: ${YELLOW}cd 'folder_name'${NC}"
    echo -e "   • Open the book: ${YELLOW}open index.html${NC}"
    echo -e "   • Or directly: ${YELLOW}open 'folder_name/index.html'${NC}"
    echo ""
    
    echo -e "${BLUE}📖 Quick access examples:${NC}"
    for folder in */; do
        if [ -d "$folder" ] && [ -f "$folder/index.html" ]; then
            folder_name="${folder%/}"
            echo -e "   ${YELLOW}open '$folder_name/index.html'${NC}"
            break
        fi
    done
    echo ""
fi

echo -e "${GREEN}🎉 All conversions complete!${NC}"
echo -e "${BLUE}📚 Your books are now organized in separate folders with HTML versions${NC}"

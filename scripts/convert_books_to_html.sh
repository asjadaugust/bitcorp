#!/bin/bash

# PDF to HTML Converter Script
# Converts all PDF files in the books folder to HTML format

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

echo -e "${BLUE}📚 PDF to HTML Converter${NC}"
echo -e "${BLUE}=========================${NC}"
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

# Convert each PDF file
converted=0
failed=0

for pdf_file in *.pdf; do
    if [ -f "$pdf_file" ]; then
        echo -e "${BLUE}📖 Converting:${NC} $pdf_file"
        
        # Generate HTML filename (replace .pdf with .html)
        html_file="${pdf_file%.pdf}.html"
        
        # Check if HTML file already exists
        if [ -f "$html_file" ]; then
            echo -e "${YELLOW}⚠️  HTML file already exists: $html_file${NC}"
            read -p "   Overwrite? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}⏭️  Skipping: $pdf_file${NC}"
                echo ""
                continue
            fi
        fi
        
        # Convert PDF to HTML
        # Options:
        # -c: Generate complex output (with CSS)
        # -noframes: Don't generate frames
        # -zoom: Zoom factor (1.5 for better readability)
        if pdftohtml -c -noframes -zoom 1.5 "$pdf_file" 2>/dev/null; then
            # pdftohtml creates filename.html automatically
            # Check if the generated HTML file exists and rename if needed
            generated_html="${pdf_file%.pdf}.html"
            if [ -f "$generated_html" ] && [ "$generated_html" != "$html_file" ]; then
                mv "$generated_html" "$html_file"
            fi
            echo -e "${GREEN}✅ Success:${NC} $html_file"
            ((converted++))
        else
            echo -e "${RED}❌ Failed to convert:${NC} $pdf_file"
            ((failed++))
        fi
        echo ""
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

# List generated HTML files
html_count=$(find . -maxdepth 1 -name "*.html" | wc -l | tr -d ' ')
if [ $html_count -gt 0 ]; then
    echo -e "${GREEN}📄 Generated HTML files:${NC}"
    ls -la *.html | while read -r line; do
        echo -e "   ${GREEN}•${NC} $line"
    done
    echo ""
fi

echo -e "${GREEN}🎉 Conversion complete!${NC}"
echo -e "${BLUE}💡 You can now view the books in HTML format in your browser${NC}"

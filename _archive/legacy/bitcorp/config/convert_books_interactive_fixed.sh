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

# Function to convert a single PDF
convert_pdf() {
    local pdf_file="$1"
    echo -e "${BLUE}📖 Converting:${NC} $pdf_file"
    
    # Generate HTML filename
    html_file="${pdf_file%.pdf}.html"
    
    # Check if HTML file already exists
    if [ -f "$html_file" ]; then
        echo -e "${YELLOW}⚠️  HTML file already exists: $html_file${NC}"
        if [ "$AUTO_MODE" = true ]; then
            echo -e "${YELLOW}⏭️  Auto mode: Skipping existing file${NC}"
            ((skipped++))
            echo ""
            return
        else
            read -p "   Overwrite? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}⏭️  Skipping: $pdf_file${NC}"
                ((skipped++))
                echo ""
                return
            fi
        fi
        # Clean up existing files
        rm -f "$html_file"
        rm -f "${pdf_file%.pdf}"*.png
    fi
    
    # Show progress
    echo -e "   ${YELLOW}⏳ Processing... (this may take a while for large PDFs)${NC}"
    
    # Convert PDF to HTML (redirect output to minimize noise)
    if pdftohtml -c -noframes -zoom 1.5 "$pdf_file" > /dev/null 2>&1; then
        # Check if HTML file was created
        generated_html="${pdf_file%.pdf}.html"
        if [ -f "$generated_html" ]; then
            echo -e "   ${GREEN}✅ Success:${NC} $html_file"
            
            # Count generated image files
            img_count=$(ls "${pdf_file%.pdf}"*.png 2>/dev/null | wc -l | tr -d ' ')
            if [ $img_count -gt 0 ]; then
                echo -e "   ${BLUE}📸 Generated $img_count page images${NC}"
            fi
            
            ((converted++))
        else
            echo -e "   ${RED}❌ Failed: HTML file not created${NC}"
            ((failed++))
        fi
    else
        echo -e "   ${RED}❌ Failed to convert:${NC} $pdf_file"
        ((failed++))
    fi
    echo ""
}

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

# Ask user about conversion mode
echo -e "${BLUE}Choose conversion mode:${NC}"
echo -e "  ${GREEN}1)${NC} Convert all PDFs automatically"
echo -e "  ${GREEN}2)${NC} Convert PDFs one by one (with confirmation)"
echo -e "  ${GREEN}3)${NC} Convert specific PDFs only"
echo -e "  ${GREEN}4)${NC} Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        AUTO_MODE=true
        CONFIRM_EACH=false
        ;;
    2)
        AUTO_MODE=false
        CONFIRM_EACH=true
        ;;
    3)
        AUTO_MODE=false
        CONFIRM_EACH=false
        echo ""
        echo -e "${BLUE}Available PDF files:${NC}"
        ls -1 *.pdf | nl
        echo ""
        read -p "Enter the numbers of PDFs to convert (e.g., 1 3 5): " selected_numbers
        ;;
    4)
        echo -e "${YELLOW}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""

# Convert PDFs based on selected mode
converted=0
failed=0
skipped=0

if [ "$choice" = "3" ]; then
    # Convert specific PDFs
    pdf_array=(*.pdf)
    for num in $selected_numbers; do
        if [[ $num =~ ^[0-9]+$ ]] && [ $num -le $pdf_count ] && [ $num -ge 1 ]; then
            pdf_file="${pdf_array[$((num-1))]}"
            if [ -f "$pdf_file" ]; then
                convert_pdf "$pdf_file"
            fi
        else
            echo -e "${RED}❌ Invalid number: $num${NC}"
        fi
    done
else
    # Convert all PDFs (with or without confirmation)
    for pdf_file in *.pdf; do
        if [ -f "$pdf_file" ]; then
            if [ "$CONFIRM_EACH" = true ]; then
                echo -e "${BLUE}📖 Convert:${NC} $pdf_file"
                read -p "   Continue? (y/N/q): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Qq]$ ]]; then
                    echo -e "${YELLOW}⏹️  Conversion stopped by user${NC}"
                    break
                elif [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    echo -e "${YELLOW}⏭️  Skipping: $pdf_file${NC}"
                    ((skipped++))
                    echo ""
                    continue
                fi
            fi
            
            convert_pdf "$pdf_file"
        fi
    done
fi

# Summary
echo -e "${BLUE}📊 Conversion Summary${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${GREEN}✅ Successfully converted: $converted files${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ Failed conversions: $failed files${NC}"
fi
if [ $skipped -gt 0 ]; then
    echo -e "${YELLOW}⏭️  Skipped: $skipped files${NC}"
fi
echo -e "${YELLOW}📁 Total PDF files: $pdf_count${NC}"
echo ""

# List generated HTML files
html_count=$(find . -maxdepth 1 -name "*.html" | wc -l | tr -d ' ')
if [ $html_count -gt 0 ]; then
    echo -e "${GREEN}📄 Available HTML files:${NC}"
    ls -1 *.html | while read -r file; do
        size=$(du -h "$file" | cut -f1)
        echo -e "   ${GREEN}•${NC} $file (${size})"
    done
    echo ""
    
    echo -e "${BLUE}💡 Tips:${NC}"
    echo -e "   • Open HTML files in your browser to view the converted books"
    echo -e "   • Each book also has associated PNG images for better quality"
    echo -e "   • Use 'open filename.html' to open in default browser"
    echo ""
fi

echo -e "${GREEN}🎉 Conversion complete!${NC}"

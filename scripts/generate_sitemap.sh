#!/bin/bash

# Function to recursively find all HTML files in the given repository path
find_html_files() {
    local repo_path="$1"
    find "$repo_path" -type f -name "*.html"
}

# Function to generate the sitemap content
generate_sitemap() {
    local base_url="$1"
    local repo_path="$2"

    # Start the sitemap XML content
    echo '<?xml version="1.0" encoding="UTF-8"?>'
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    # Find all HTML files and process them
    for file in $(find_html_files "$repo_path"); do
        # Create a relative URL path
        local relative_path
        relative_path=$(realpath --relative-to="$repo_path" "$file" | sed 's/ /%20/g' | tr '\\' '/')
        local url="$base_url/$relative_path"

        # Get the last modified date of the file
        local last_modified
        last_modified=$(date -r "$file" "+%Y-%m-%d")

        # Generate the XML entry for this file
        echo "  <url>"
        echo "    <loc>$url</loc>"
        echo "    <lastmod>$last_modified</lastmod>"
        echo "    <changefreq>weekly</changefreq>"
        echo "    <priority>0.5</priority>"
        echo "  </url>"
    done

    # Close the sitemap XML content
    echo '</urlset>'
}

# Main script
echo "Enter the path to your repository: "
read -r repo_path
echo "Enter the base URL of your website (e.g., https://www.example.com): "
read -r base_url

# Check if the repository path exists
if [ ! -d "$repo_path" ]; then
    echo "Error: The specified repository path does not exist."
    exit 1
fi

# Generate and save the sitemap
sitemap_file="sitemap.xml"
generate_sitemap "$base_url" "$repo_path" > "$sitemap_file"

echo "Sitemap has been generated and saved to $sitemap_file."s
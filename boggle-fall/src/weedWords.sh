# A quick script to take our raw text and shrink it down
sed -n "1,/---/p" < words-raw.txt > word-license.txt
sed "1,/---/d" < words-raw.txt > words-trimmed.txt
sed -i "" '/[^a-z]/d' words-trimmed.txt
sed -i "" '/^..$/d' words-trimmed.txt
sed -i "" '/^.$/d' words-trimmed.txt

matching_offensive="matching-offensive.txt"
rm $matching_offensive
touch "$matching_offensive"
offensive_list="offensive_words.txt"
# Step 6: Remove offensive words or patterns from the cleaned wordlist
while IFS= read -r pattern; do
    sed -i '' "/$pattern/d" words-raw.txt
    grep -E "$pattern" words-raw.txt >> "$matching_offensive"
done < "$offensive_list"
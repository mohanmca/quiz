## quiz

## Nginx configurations

```
    location /quiz {
        autoindex on;
        autoindex_exact_size off;
        autoindex_localtime on;

        location ~* \.(html|css|js|json)$ {
            try_files $uri =404;
            add_header Cache-Control "public, max-age=3600";
        }
        location ~ \. {
            deny all;
        }
    }
```

## Deployment
```
git config --global --add safe.directory /tmp/quiz
mkdir -p /tmp/quiz
cd /tmp/quiz
git pull
cp -r ../quiz/ /var/www/indiatruck/public/
chown -R  www-data:www-data /var/www/indiatruck/public/
chmod 755 /var/www/indiatruck/public/
```


## How to register a new quiz
1. Generate the questions JSON in the expected format (array of items with `title`/`question`, `choices`/`options`, and `correctAnswer`).
2. Add an entry in `programming/data/json/surveys.json` with a unique `id` and the `questionsFile` path (relative to `programming/`).
3. Run locally via a web server and confirm the quiz loads and renders without console errors.
4. Example prompt

1. Under "Data Structures & Algorithms" Category, can you generate new quiz file like python/leetcode-medium-questions-fixed.json for Fenwick tree fundamentals and ensure   quiz covers basics knowledge of Fenwick and sample program to update getsum. Overall we need to create new quiz for Fenwick tree and number of questions should be 50 and regsitered and should be accessible

---
**New Quiz Registered:**  
- Title: Bitwise Operations - Part I  
- Category: Data Structures & Algorithms  
- Questions File: `python/bitwise-operations-part1-questions.json`  
- ID: `bitwise-operations-part1`  
- Source: [Bitwise Operations Anki](https://github.com/mohanmca/CodingChallenges/blob/master/src/md/coding_patterns/25_bits_binary_anki.md)

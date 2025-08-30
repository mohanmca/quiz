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
cd /tmp/quiz
git pull
cp -r ../quiz/ /var/www/indiatruck/public/
chown -R  www-data:www-data /var/www/indiatruck/public/
chmod 755 /var/www/indiatruck/public/
```


## How to register new quiz
1. generate data json in quiz format
2. register the file name in surveys.json without unique id
3. register the id from surveys.json and update in quiz-data-manager.js
4. If this is new category, we have to register in quiz-platform.js
5. Example prompt

1. Under "Data Structures & Algorithms" Category, can you generate new file like python/leetcode-medium-questions-fixed.json for for fenwick tree fundamentals and ensure   quiz covers basics knowledge of fenwick and sample program to update getsum. Overall we need to create new quiz for fenwick tree and number of questions should be 50 and regsitered and should be accessible

---
**New Quiz Registered:**  
- Title: Bitwise Operations - Part I  
- Category: Data Structures & Algorithms  
- Questions File: `python/bitwise-operations-part1-questions.json`  
- ID: `bitwise-operations-part1`  
- Source: [Bitwise Operations Anki](https://github.com/mohanmca/CodingChallenges/blob/master/src/md/coding_patterns/25_bits_binary_anki.md)
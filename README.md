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
git clone git@github.com:mohanmca/quiz.git
git config --global --add safe.directory /tmp/quiz
mkdir -p /tmp/quiz
cd /tmp/quiz
git pull
cp -r ../quiz/ /var/www/indiatruck/public/
chown -R  www-data:www-data /var/www/indiatruck/public/
chmod 755 /var/www/indiatruck/public/
curl https://indiatruck.in/quiz/programming/index.html
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


-- Can you merge the article and quiz of the both 

PostgreSQL Query Planning Internals
PostgreSQL PSQL, EXPLAIN & Automation
Move everthing under "PostgreSQL PSQL, EXPLAIN & Automation"



1. Can you read all the markdown related to LeetCode patterns /Users/mohannarayanaswamy/git/CodingChallenges/src/md/coding_patterns
2. Update the article and quiz form "LeetCode Medium Problems - Python Solutions"
3. Don't pick any problem that has more than 22 lines in python (ignore space)
4. Categorize pattern wise in article
5. Quiz should also contain code snippets to remember
6. Artcile should emphasise order of the programs and code 
7. Can you add some math combinatorial tips tricks to article to manage and reduce off-by-one-error
8. Answers in markdown could be Java, need to convert to python


Can you add a short pattern-to-problem index in the article’s overview (e.g., which pattern to try first for common LeetCode topics)

---

We need one more quiz similar to other quizes and articles
1. I need a way to improve code navigation inside Intellij, can you write article and quiz and downloadable cheatsheet
2. Give all the menu for latest Intellij Idea based shortcut in article and quiz
3. Focus on navigation and usage finding and include git related feature
4. Cover all the shortcut key
5. Create quiz for all the above + shortcut key
6. Article should have a topic to continuously improve navation ability of the developer
7. For different usescases explain when to use git annotate blame
8. Assume bazel is the build of the project
9. We use C++  scala
10. Should cover method hierarchy call hierarchy implicit and traits and other complicated navigation tricks
11. Assume code may have multiple implementation


We need one more quiz similar to other quizes and articles
1. It should cover scala version 2.13 (avoid latest scala 3 and above)
2. Introduction to traits
3. Why it is used and how it is linearize
4. Give usecases
5. Cover indepdently about implicits without traits and all its usage
6. Cover implicits resolution and how many ways it is resolved and order, and navigate
7. By using implicit and traits how many patterns of the solutions can be created, and give all the details
8. Let the article be more than 30000 words, it should be descriptive not brief
9. For each programming Slides, can you add a additional tab (one tab is Slide itself), and another tab should have 3 to 5 questions about the code that should hide answer and on clicking ... (similar to Cloze Deletion), it should reveal answer, it would help to review and understand important questions
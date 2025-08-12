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

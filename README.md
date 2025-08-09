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
cd /tmp/
git pull
cp -r quiz/ /var/www/indiatruck/
chown -R  www-data:www-data quiz/
chmod 755 quiz/
```

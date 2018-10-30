#  Chadrick's dataset labeling web tools

a very simple/rought version for prototype.
currently supports
- single class segmentation labeling
- bounding box viewer
- bouding box labeling

![mainpage](/docs/mainpage.png)

![bbox labeling screenshot](/docs/bbox_labeling_screenshot.png)

![bbox viewer screenshot](/docs/bboxviewer_screenshot.png)

![web interface sample](/docs/web_interface_screenshot.png)

![output file sample](/docs/output_screenshot.png)


## Developent Environment
It is recommended to follow this development environment as much as possible.

- Ubuntu 18.04.1 LTS
- python3(3.6.5)
- Chrome Version 69.0.3497.100 (Official Build) (64-bit)


## Caution

Please note that in order to reduce development time, this django project may not have followed the best practices. For instance, the current version does not use any databases and no dataset management is implemented. Also, there are a lot of bugs lurking around.

By default, the django will run in DEBUG mode.


## Getting Started

### 1. prepare python virtual environment and install necessary packages


the python packages that are required are inside `requirements.txt` file.

Recommended to create a python3 vritualenv and install the packages with 
```
$ pip install -r requirements.txt
```

### 2. create `/static/images` and`/static/saves` directory.

### 3. relocate images into `/static/images`

### 4. run server

```
$ python manage.py runserver
```

by default it should run on port 8000. If you wish to allow LAN network to access the server, then use the following command

```
$ python manage.py runserver 0.0.0.0:8000
```

the command above has been prepared in `startserver.sh` files so the user may try this instead:
```
$ source startserver.sh
```


### 5. open web browser and start labeling. 

- since the default port is 8000, open a web browser and go to `http://localhost:8000`
- check out the `How to use ~` sections for more information.

## Docs for each tool

- [segmentation tool](/docs/segmentation_tool_readme.md)
- [bbxViewer](/docs/bbxviewer_readme.md)
- [bbox labeling](/docs/bbox_labeling_readme.md)

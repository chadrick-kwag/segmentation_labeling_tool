# segmentation labeling tool

a very simple/rought version for prototype


![web interface sample](/docs/web_interface_screenshot.png)

![output file sample](/docs/output_screenshot.png)


## Requirements
- python3 (developed with python3.6.5)
- Web Browser(Firefox recommended since it was developed with it. Developed with Firefox 62.0 64-bit)


## Getting Started

Please note that in order to reduce development time, this django project may not have followed the best practices. For instance, the current version does not use any databases and no dataset management is implemented. Also, there are a lot of bugs lurking around.

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
$ python manager.py runserver
```

by default it should run on port 8000.

### 5. open web browser and start labeling. 

- since the default port is 8000, open a web browser and go to `http://localhost:8000`
- checkout **How to use the web interface** for more details on how to use the web interface


## How to use the web interface

### navigation
- With `PageUp` and `PageDown` key user can navigate through the image to label. When navigating with this method, labeling progress will be saved automatically.
- The user can navigate through images with the slidebar on the top as well. When navigating with this method, labeling progress will **NOT** be saved automatically. (**VERY BUGGY. PLEASE AVOID USING THIS FOR NOW AS MUCH AS POSSIBLE**)
- User can save the current image's labeling progress manually by pressing `s` button.

### drawing
- draw the area by pushing mouse down, dragging around the area, and releasing the mouse click.
- user can select the area by clicking on the edge of a path.
- once a path is selected, it can be deleted by pressing the `delete` button
- multiple paths can be selected simultaneously

### converting
- When labeling is all done and the user is ready to convert all the labeling data into actual masked `.png` files, click the `convert` button on bottom-left of the screen.
- If labeling is not done for all images, or some labels are empty, then an alert message will appear.
- If labeling is done without any problems, then the conversion of label saves to png files will start. The screen will show the progress.
- Once the conversion is done, the progress screen will disappear automatically.
- After the convserion is done, please check the converted png files under the `/static/output` directory.

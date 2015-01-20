# XControls

## v1.3.0 / 2015-01-20

* Fix a bug where the Add button in the accordion list was not working correctly, thanks [aysekai](https://github.com/ayesekai)
* Fix a bug where JS is not fired when a new document is created, thanks [Rich Sharpe](https://github.com/richsharpe)
* Add option to not open first document in list automatically, thanks [Rich Sharpe](https://github.com/richsharpe)
* Improve the functionality of the Login Control, thanks [Rich Sharpe](https://github.com/richsharpe)
* Fix bug with detailcolumn not displaying correctly in Accordion List control, thanks [Mitsuru Katoh](https://github.com/katoman) and [khsopro](https://github.com/khsopro)
* Fix bug with display of Flat View when rotating iPad from portrait to landscape, thanks [Rich Sharpe](https://github.com/richsharpe)
* Allow creation of new documents from header bar on desktop, thanks [Rich Sharpe](https://github.com/richsharpe)
* Fix bug with view icons not displaying correctly in the Accordion List, thanks [susinmn](https://github.com/susinmn)
* Callback support added to openDocument, editDocument and saveDocument events to allow developer to add post processing, thanks [Rich Sharpe](https://github.com/richsharpe)
* Fix bug with New Response button in Form Viewer control, thanks [Mitsuru Katoh](https://github.com/katoman)
* Added date picker for Firefox and IE desktop browsers (native pickers used elsewhere), thanks [Neil Evans](https://github.com/neilevans)
* Add drop down support for desktop header bar, thanks [Steve Ives](https://github.com/sives)

## v1.2.0 / 2014-11-17

* Add new UnpBootDetailedView control to support the Bootcards detailed list pattern
* Fix bug where page scrolled when scrolling slide in menu, thanks [Mark Leusink](https://github.com/markleusink)
* Fix bug where menu was transparent at bottom, thanks [Mark Leusink](https://github.com/markleusink)
* Improve save document process to update document summary in FlatView after saving
* Add new Login control for use with web applications
* Update UnpDialog callback to allow developer to choose whether dialog is closed automatically on OK, thanks [Martin Perrie](https://github.com/martinperrie)
* Update UnpDialog to allow developer to choose whether OK or cancel buttons are visible, thanks [Martin Perrie](https://github.com/martinperrie)
* Update Carousel Control to support captions for images in carousel, thanks [Ady Makombo](https://github.com/adymakombo)
* Allow custom buttons to be inserted in FormViewer header using a new editable area, thanks [Rich Sharpe](https://github.com/richsharpe)
* Update documentation to make clearer the requirement for FormViewer fields to be wrapped with h4 tags, thanks[Rich Sharpe](https://github.com/richsharpe)
* Upgrade version on Bootcards to v1.1, thanks [Mark Leusink](https://github.com/markleusink)
* Update XControls website to [xcontrols.org](http://xcontrols.org)
* Add support for runtime optimized CSS and JS which dramatically reduces page sizes for web applications, thanks [Mark Leusink](https://github.com/markleusink)

We do have one known issue with the A-Z Picker when using it in iOS and Unplugged (not Safari), there are situations where the list will disappear until the user touches their screen again. We're still investigating a solution to this issue.

## v1.1.1 / 2014-10-21

* UnpBootFlatView - white space on left of data in view when no icon is used
* Updated license files to take account of OFL for Font Awesome

## v1.1 / 2014-10-21

* fixed; issue with calendar entries in latest Firefox, thanks [Howard Greenberg](https://github.com/howardtlcc)
* UnpBootFiles Control * either doc is wrong or the files are not automatically populated when form is in an external DB, thanks [Rich Sharpe](https://github.com/richsharpe)
* Change sampler app menu layout
* Change Controls Group Name
* Github name
* No documnetation for the UnpPhotoUpload control, thanks [Rich Sharpe](https://github.com/richsharpe)
* Search using a desktop browser does not work, thanks [Howard Greenberg](https://github.com/howardtlcc)
* Categorized view on iPhone issue, thanks [Howard Greenberg](https://github.com/howardtlcc)
* Tablet - Rotate from Landscape to Portrait loses navigation, thanks [Reid Canavan](https://github.com/reidcanavan)
* unpBootAccordianView - Add button - Show option, thanks [Reid Canavan](https://github.com/reidcanavan)
* Rename TypographyEdit and TypographyRead controls
* AZ picker is cut off in landscape Mode
* Change UnpBootFormViewer to render std buttons on true/false not 'yes'/!'yes', thanks [Rich Sharpe](https://github.com/richsharpe)
* Icons not aligned correctly in lists
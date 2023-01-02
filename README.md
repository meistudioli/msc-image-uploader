# msc-image-uploader

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/msc-image-uploader) [![DeepScan grade](https://deepscan.io/api/teams/16372/projects/23419/branches/709357/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=23419&bid=709357)

&lt;msc-image-uploader /> is a web component based image uploader. Users could pick & upload images by 「file picker」、「drag & drop」and even direct「paste」image content. Besides that, users could also change images sorting through 「drag & drop」or 「keyboard arrow keys」. With rich config setting, developers can set up placeholder and limitation for different scenarios.

![<msc-image-uploader />](https://blog.lalacube.com/mei/img/preview/msc-image-uploader.png)

## Basic Usage

&lt;msc-image-uploader /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;msc-image-uploader />'s html structure and everything will be all set.

- Required Script

```html
<script
  type="module"
  src="https://your-domain/wc-msc-image-uploader.js">        
</script>
```

## Structure

Put &lt;msc-image-uploader /> into HTML document. It will have different functions and looks with attribute mutation.

```html
<msc-image-uploader>
  <script type="application/json">
      {
        "fieldname": "image",
        "limitation": {
          "size": 52428800,
          "accept": ".jpg,.jpeg,.png,.gif,.webp,.avif",
          "minwidth": 100,
          "minheight": 100,
          "maxcount": 10
        },
        "placeholder": [
          {
            "src": "https://your-domain/img/img-0.jpg",
            "crumb": "dsaRxsa"
          },
          {
            "src": "https://your-domain/img/img-1.jpg",
            "crumb": "ptScwKdQ"
          }
        ],
        "webservice": {
          "url": "https://your-domain/uploadApi",
          "params": {
            "id": "mei",
            "sex": "M"
          },
          "header": {
            "content-type": "application/json"
          },
          "timeout": 20000
        }
      }
  </script>
</msc-image-uploader>
```

Otherwise, developers could also choose remoteconfig to fetch config for &lt;msc-image-uploader />.

```html
<msc-image-uploader
  remoteconfig="https://your-domain/api-path"
>
</msc-image-uploader>
```

## JavaScript Instantiation

&lt;msc-image-uploader /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { MscImageUploader } from 'https://your-domain/wc-msc-image-uploader.js';

// use DOM api
const nodeA = document.createElement('msc-image-uploader');
document.body.appendChild(nodeA);
nodeA.webservice = {
  url: 'https://your-domain/uploadApi'
};
nodeA.fieldname = 'image';

// new instance with Class
const nodeB = new MscImageUploader();
document.body.appendChild(nodeB);
nodeB.limitation = {
  accept: '.jpg,.jpeg,.png',
  minwidth: 200,
  minheight: 200
};

// new instance with Class & default config
const config = {
  fieldname: 'image',
  limitation: {
    size: 52428800,
    accept: '.jpg,.jpeg,.png,.gif,.webp,.avif',
    minwidth: 100,
    minheight: 100,
    maxcount: 10
  },
  placeholder: [],
  webservice: {
    url: '/',
    params: {},
    header: {},
    timeout: 30000
  }
};
const nodeC = new MscImageUploader(config);
document.body.appendChild(nodeC);
</script>
```

## Storage

&lt;msc-image-uploader /> will generate (query) an `input[type=hidden]` as storage. &lt;input /> default name is `msc-image-upload`, developers can switch any name they liked.

```html
<msc-image-uploader>
  <input type="hidden" name="msc-image-uploader" value="..." />
</msc-image-uploader>
```

## Style Customization

Developers could apply styles to decorate &lt;msc-image-uploader />'s looking.

```html
<style>
msc-image-uploader {
  --msc-image-uploader-gap: 12px;
  --msc-image-uploader-column-count: 4;
  --msc-image-uploader-dragging-opacity: .5;
  --msc-image-uploader-focus-within-bgc: rgba(255 255 255/.01);

  --msc-image-uploader-main-drop-overlay-color: rgba(0 0 0/.7);
  --msc-image-uploader-main-drop-hint-text-color: rgba(255 255 255);
  --msc-image-uploader-main-drop-hint-text-size: 40px;
  --msc-image-uploader-main-drop-hint-text: 'DROP IMAGES HERE.';

  --msc-image-uploader-label-bgc: rgba(232 234 237/.04);
  --msc-image-uploader-label-color: #606367;
  --msc-image-uploader-label-hint-text: 'pick images';

  --msc-image-uploader-loading-color: rgba(255 255 255);
  --msc-image-uploader-loading-bgc: rgba(0 0 0/.05);
}
</style>
```

Otherwise, apply pseudo class `::part(decoration)` to direct style each unit. Besides that, developers cpuld also apply pseudo class `::part(decoration-{n})` for specific unit.

```html
<style>
msc-image-uploader::part(decorations)::before {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  content: 'image';
  font-size: 12px;
  color: #fff;
  background-color: rgba(0 0 0/.8);
  padding: 2px 6px;
  border-end-end-radius: 4px;
  display: none;
}

msc-image-uploader::part(decorations-1)::before {
  content: '1st';
  color: #f00;
}
</style>
```

## Attributes

&lt;msc-image-uploader /> supports some attributes to let it become more convenience & useful.

- **fieldname**

Set fieldname for &lt;msc-image-uploader />. Each upload image fetch will apply this ad file's field name. Default is `image` (not set).

```html
<msc-image-uploader
  fieldname="image"
>
  ...
</msc-image-uploader>
```

- **limitation**

Set limitation for &lt;msc-image-uploader />. It should be JSON string. &lt;msc-image-uploader /> will go through these rules when user picked files. Default is list in following sample (not set).

- `size`：max file size (byte). Default is `52428800`.
- `accept`：accepted able types. Default is `.jpg,.jpeg,.png,.gif,.webp,.avif`.
- `minwidth`：image min-width (px). Default is `100`.
- `minheight`：image min-height (px). Default is `100`.
- `maxcount`：Max file count. Default is `10`.

```html
<msc-image-uploader
  limitation='{"size":52428800,"accept":".jpg,.jpeg,.png,.gif,.webp,.avif","minwidth":100,"minheight":100,"maxcount":10}'
>
  ...
</msc-image-uploader>
```

- **webservice**

Set web service information for &lt;msc-image-uploader />. It should be JSON string. Developers could set `url`、`params`、`header` and `timeout` here.

- `url`：api address for upload image. Default is `/`.
- `params`：Set parameters. Each of them will be attached with fetch. Default is `{}`.
- `header`：Set fetch header. Default is `{}`.
- `timeout`：Set timeout for fetch. Default is `30000` (ms).

```html
<msc-image-uploader
  webservice='{"url":'/',"params":{},"header":{}}'
>
  ...
</msc-image-uploader>
```

## placeholder

Set placeholder for &lt;msc-image-uploader />. It should be JSON string. Each element should include `src` for thumbnail display. Default is `[]` (not set).

```html
<msc-image-uploader
  placeholder='[{"src":"https://your-domain/img/img-0.jpg","other":"xxx"},{"src":"https://your-domain/img/img-1.jpg","other":"xxx"}]'
>
  ...
</msc-image-uploader>
```

## Properties

| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| fieldname | String | Getter / Setter for fieldname. Each upload image fetch will apply this ad file's field name. Default is `image` (not set). |
| limitation | Object | Getter / Setter for limitation. <msc-image-uploader /> will go through these rules when user picked files. |
| webservice | Object | Getter / Setter for web service information. Developers could set `url`、`params`、`header` and `timeout`. |
| placeholder | Array | Getter / Setter for placeholder. Each element should include `src` for thumbnail display. Default is `[]` (not set).|
| processing | Boolean | Getter for <msc-image-uploader />'s fetching status. |
| uploadInfo | Array | Getter for <msc-image-uploader />'s current uploaded information. |
| count | Number | Getter for current <msc-image-uploader />'s uploaded units count. (include fails) |

## Event

| Event Signature | Description |
| ----------- | ----------- |
| msc-image-uploader-pick | Fired when users picked files. |
| msc-image-uploader-error | Fired when <msc-image-uploader /> occured errors. (validation & fetch) |
| msc-image-uploader-remove | Fired when <msc-image-uploader /> removed unit successed. |
| msc-image-uploader-upload-done | Fired when <msc-image-uploader /> finished fetching. |

## Reference
- [&lt;msc-image-uploader />](https://blog.lalacube.com/mei/webComponent_msc-image-uploader.html)
- [WEBCOMPONENTS.ORG](https://www.webcomponents.org/element/msc-image-uploader)
- [YouTube](https://www.youtube.com/watch?v=CeaF9UOIvsY)

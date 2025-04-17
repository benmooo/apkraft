# APKraft

### Database design

#### Platform

```sh
cargo loco generate scaffold platform \
  name:string! \
  code:small_unsigned^ \
  icon_url:text --api
```

#### File

path: opendal compatiable

```sh
cargo loco generate scaffold file \
  name:string! \
  mime:string! \
  size_bytes:big_int! \
  path:string! \
  checksum_sha256:string! \
  description:text --api
```

#### App

```sh
cargo loco generate scaffold app \
              name:string! \
              bundle_id:string^ \
              platform:references \
              icon_file_id:int \
              current_version_id:int \
              description:text --api
```

#### App version

```sh
cargo loco generate scaffold app_version \
  app:references \
  version_code:string! \
  version_name:string! \
  release_notes:text \
  apk_file_id:int \
  published_at:tstz --api
```


#### create foreign keys

```sh
cargo loco g migration CreateFkAppsIconFileIdToFiles
cargo loco g migration CreateFkAppsCurrentVersionIdToAppVersions
cargo loco g migration CreateFkAppVersionsApkFileIdToFiles
```

### sync entities

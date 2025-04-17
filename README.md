# APKraft

### Database design

#### Platform

```sh
cargo loco generate scaffold platform \
  name:string! \
  code:small_unsigned^ \
  icon_url:text --api
```

#### App

```sh
cargo loco generate scaffold app \
              name:string! \
              bundle_id:string^ \
              platform:references \
              icon_url:text \
              description:text --api
```

#### APK File

```sh
cargo loco generate scaffold apk_file \
              name:string! \
              path:string! \
              size_bytes:big_int! \
              checksum_sha256:text! --api
```

#### App version

```sh
cargo loco generate scaffold app_version \
  app:references \
  version_code:string! \
  version_name:string! \
  release_notes:text \
  apk_file:references \
  published_at:tstz --api
```

#### Add column(current_version_id) to apps table

```sh
cargo loco g migration AddCurrentVersionIdToApps current_version_id:int
```

#### create foreign key for current_version_id in apps table

```sh
cargo loco g migration AddCurrentAppVersionIdToUsers current_version_id:int
```

## Prerequisites

https://firebase.google.com/docs/firestore/manage-data/export-import#before_you_begin

## Steps

1.  [Open the Cloud Shell](https://console.cloud.google.com/?cloudshell=true)
1.  Set the project if the Cloud Shell didn't open within the correct project.

    🔁 Replace `[PROJECT_ID]` with the Firebase project ID.

    ```sh
    gcloud config set project [PROJECT_ID]
    ```

1.  Store the project ID in a variable:

    ```sh
    PROJECT_ID=$(gcloud config get-value project)
    ```

1.  Find the bucket if you forgot it from the last time you did this:

    ```sh
    gcloud storage buckets list --format="json(location,name)"
    ```

1.  Store the bucket name in a variable:

    🔁 Replace `[BUCKET_NAME]` with the name of the bucket.

    ```sh
    BUCKET_NAME=[BUCKET_NAME]
    ```

1.  [Export the collections](https://firebase.google.com/docs/firestore/manage-data/export-import#export_specific_collections).

    ```sh
    gcloud firestore export gs://$BUCKET_NAME --collection-ids=highlights,volumes
    ```

1.  📋 Copy the `outputUriPrefix:` `gs://` value from the `gcloud firestore export` output. Set a `OUTPUT_URI_PREFIX` variable:

    🔁 Replace the `[GS_URI]` value.

    ```sh
    OUTPUT_URI_PREFIX=[GS_URI]
    ```

1.  Create a BigQuery dataset (or replace a previous one)

    ```sh
    bq --location=US-CENTRAL1 mk --force=true --dataset highlights_export
    ```

1.  [Load the Firestore data into BigQuery](https://cloud.google.com/bigquery/docs/loading-data-cloud-firestore).

    **Highlights collection**:

    ```sh
    bq --location=US-CENTRAL1 load \
      --source_format=DATASTORE_BACKUP \
      --replace=true \
      highlights_export.highlights \
      $OUTPUT_URI_PREFIX/all_namespaces/kind_highlights/all_namespaces_kind_highlights.export_metadata
    ```

    **Volumes collection**:

    ```sh
    bq --location=US-CENTRAL1 load \
      --source_format=DATASTORE_BACKUP \
      --replace=true \
      highlights_export.volumes \
      $OUTPUT_URI_PREFIX/all_namespaces/kind_volumes/all_namespaces_kind_volumes.export_metadata
    ```

1.  Query the data:

    ```sh
    bq query \
      --use_legacy_sql=false \
      --destination_table=highlights_export.query \
      --replace=true \
      "SELECT
        h.body,
        h.volume.name as \`volume_key\`,
        h.__key__.name as \`highlight_key\`,
        v.title as \`volume_title\`,
        v.subtitle as \`volume_subtitle\`
      FROM
        \`$PROJECT_ID.highlights_export.highlights\` as h
      JOIN
        \`$PROJECT_ID.highlights_export.volumes\` as v
      ON
        h.volume.name = v.__key__.name
      WHERE
        LENGTH(h.body) > 10 AND h.visible = true
      ORDER BY
        h.createdAt DESC"
    ```

1.  [Extract the query results table to Cloud Storage](https://cloud.google.com/bigquery/docs/reference/bq-cli-reference#bq_extract)

    ```sh
    bq extract \
      --destination_format=NEWLINE_DELIMITED_JSON \
      highlights_export.query \
      gs://$BUCKET_NAME/query_export.json
    ```

1.  Download the query export file to your local machine:

    ```sh
    gsutil cp gs://$BUCKET_NAME/query_export.json .
    cloudshell download query_export.json
    ```

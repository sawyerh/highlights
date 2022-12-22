import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";

import expressApp from "./api";
import handleHighlightCreate from "./handleHighlightCreate";
import handleStorageObjectCreate from "./handleStorageObjectCreate";
import handleStorageObjectDelete from "./handleStorageObjectDelete";
import handleVolumeCreate from "./handleVolumeCreate";
import handleVolumeUpdate from "./handleVolumeUpdate";

initializeApp();

/**
 * /api HTTPS endpoint
 */
export const api = functions.https.onRequest(expressApp);

/**
 * Firestore events
 */
export const HighlightCreate = functions.firestore
	.document("highlights/{highlightId}")
	.onCreate(handleHighlightCreate);

export const VolumeCreate = functions.firestore
	.document("volumes/{volumeId}")
	.onCreate(handleVolumeCreate);

export const VolumeUpdate = functions.firestore
	.document("volumes/{volumeId}")
	.onUpdate(handleVolumeUpdate);

/**
 * Storage events
 */
export const StorageObjectDelete = functions.storage
	.object()
	.onDelete(handleStorageObjectDelete);

export const StorageObjectCreate = functions.storage
	.object()
	.onFinalize(handleStorageObjectCreate);

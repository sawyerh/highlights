import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";
import { defineSecret, defineString } from "firebase-functions/params";

import expressApp from "./api";
import handleHighlightDelete from "./handleHighlightDelete";
import handleStorageObjectCreate from "./handleStorageObjectCreate";
import handleStorageObjectDelete from "./handleStorageObjectDelete";
import handleVolumeCreate from "./handleVolumeCreate";
import handleVolumeUpdate from "./handleVolumeUpdate";

/**
 * Environment variables
 */
const AI_FUNCTION_URL = defineString("AI_FUNCTION_URL");
const AI_API_SECRET = defineSecret("AI_API_SECRET");

/**
 * Firebase configuration
 */
initializeApp();

/**
 * /api HTTPS endpoint
 */
export const api = functions.https.onRequest(expressApp);

/**
 * Firestore events
 */
export const VolumeCreate = functions.firestore
	.document("volumes/{volumeId}")
	.onCreate(handleVolumeCreate);

export const VolumeUpdate = functions.firestore
	.document("volumes/{volumeId}")
	.onUpdate(handleVolumeUpdate);

export const HighlightDelete = functions.firestore
	.document("highlights/{highlightId}")
	.onDelete(async (_change, context) => {
		await handleHighlightDelete(context.params.highlightId, {
			url: AI_FUNCTION_URL.toString(),
			secret: AI_API_SECRET.toString(),
		});
	});

/**
 * Storage events
 */
export const StorageObjectDelete = functions.storage
	.object()
	.onDelete(handleStorageObjectDelete);

export const StorageObjectCreate = functions.storage
	.object()
	.onFinalize(handleStorageObjectCreate);

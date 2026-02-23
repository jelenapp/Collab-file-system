import {Document} from "mongoose";

/**
 * Removes the properties from a resource type.
 * @param T The resource type
 * @param K Optional keys to exclude from the resource type
 * @returns The plain resource type
 */
export type PlainResource<T, K extends keyof T = never> = Omit<T, keyof Omit<Document, "id"> | K>;
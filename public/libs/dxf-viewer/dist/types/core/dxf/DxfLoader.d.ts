import * as THREE from "three";
import { DxfChange } from "./DxfCompare";
import { DxfObject } from "./DxfObject";
import { Units } from "../../core/Units";
import { IBlock, IDxf, IEntity, ILayer, ILayoutObject, IPoint, IViewport, IViewportEntity, TableCell } from "../../core/dxf-parser";
import { ImageFlags } from "../../core/dxf-parser/entities/image";
import { IMLeaderContextData } from "../../core/dxf-parser/entities/mleader";
import { ISpatialFilterObject } from "../../core/dxf-parser/objects/spatialfilter";
import { FontManager } from "../../core/font";
/**
 * @internal
 */
export interface DxfData extends IDxf {
    threejsObject: THREE.Object3D;
    layersAndThreejsObjects: Record<string, THREE.Object3D[]>;
    loadedEntityCount: number;
    layoutViewportsMap: Record<string, IViewportEntity[]>;
}
/**
 * Dxf/dwg layer, which contains a number of objects in it.
 *
 * A layer has "name", "handle", "color", "visible" and many other properties.
 *
 * We can change a layer's visibility, color, etc.
 */
export type DxfLayer = ILayer;
/**
 * Dxf entity, which can be an arc, circle, attach, line, insert, text, etc.
 * @internal
 */
export interface DxfEntity extends IEntity {
    threejsObject?: THREE.Object3D;
    dimStyleName: string;
    dimensionType?: number;
    anchorPoint?: THREE.Vector3;
    block?: string;
    majorAxisEndPoint?: THREE.Vector2 | THREE.Vector3;
    axisRatio?: number;
    center?: THREE.Vector3;
    startAngle?: number;
    endAngle?: number;
    style?: number;
    text?: string;
    height?: number;
    width?: number;
    position?: THREE.Vector3;
    blockPosition?: IPoint;
    rotation?: number;
    directionVector?: THREE.Vector3;
    attachmentPoint?: number;
    drawingDirection?: number;
    controlPoints?: IPoint[];
    degreeOfSplineCurve?: number;
    knotValues?: number[];
    numberOfControlPoints: number;
    vertices?: IPoint[];
    shape: boolean;
    isPolyfaceMesh: boolean;
    pathType: number;
    direction: number;
    hasHookline: boolean;
    textWidth: number;
    dimensionStyle: string;
    arrowFlag: number;
    arrowHeight: number;
    arrowHeadScale: number;
    arrowHeadBlockHandle: string;
    contextData?: IMLeaderContextData;
    enableDogLeg: boolean;
    leaderLineType: number;
    arrowHeadId: string;
    arrowHeadSize: number;
    radius?: number;
    points?: THREE.Vector3[];
    startPoint?: THREE.Vector3;
    endPoint?: THREE.Vector3;
    textHeight: number;
    halign?: number;
    valign?: number;
    mirrored?: number;
    textStyle?: string;
    lineSpaceFactor?: number;
    name?: string;
    xScale?: number;
    yScale?: number;
    zScale?: number;
    elevation?: number;
    extrusionDirectionX?: number;
    extrusionDirectionY?: number;
    extrusionDirectionZ?: number;
    extrusionDirection?: {
        z: number;
    };
    entities?: IEntity[];
    tag?: string;
    prompt?: string;
    scale?: number;
    preset: boolean;
    invisible: boolean;
    documentType?: string;
    version?: number;
    leftUpX?: number;
    leftUpY?: number;
    leftUpZ?: number;
    rightDownX?: number;
    rightDownY?: number;
    rightDownZ?: number;
    tileModeDescriptor?: number;
    binaryData?: string;
    lengthOfBinaryData?: number;
    image: string;
    psBBox?: THREE.Box3;
    msToPsMatrix?: THREE.Matrix4;
    viewportThreejsObject?: DxfObject;
    associatedLeafObjectSet?: Set<THREE.Object3D>;
    associatedSpatialFilter?: DxfSpatialFilter;
    imageSize?: IPoint;
    imageDefHandle?: string;
    uPixel?: IPoint;
    vPixel?: IPoint;
    flags?: ImageFlags;
    columnCount: number;
    rowCount: number;
    cells: TableCell[];
    rowHeightArr: number[];
    columnWidthArr: number[];
    blockRecordHandle?: string;
}
/**
 * Dxf block.
 * @internal
 */
export interface DxfBlock extends IBlock {
    /**
     * References to corresponding threejs object
     */
    threejsObject?: DxfObject;
}
/**
 * Dxf layout.
 * @internal
 */
export interface DxfLayout extends ILayoutObject {
    /**
     * A collection of leaf objects directly associated with the layout, used for subsequent selection and measurement, etc.
     * "Model" space doesn't need it for now.
     */
    directAssociatedLeafObjectSet?: Set<THREE.Object3D>;
}
/**
 * Spatial filter clip polyline.
 * @internal
 */
export interface DxfSpatialFilterClipPolyline {
    polyline: THREE.Vector3[];
    bConcave: boolean;
    bReversed: boolean;
}
/**
 * Spatial filter.
 * @internal
 */
export interface DxfSpatialFilter extends ISpatialFilterObject {
    /**
     * References to corresponding threejs object
     */
    threejsObject?: DxfObject;
    localMatrix?: THREE.Matrix4;
    clipPolylines: DxfSpatialFilterClipPolyline[];
}
/**
 * Dxf loader config.
 * @internal
 */
export interface DxfLoaderConfig {
    /**
     * Ignores everything from paper space, aka, only load model space.
     */
    ignorePaperSpace?: boolean;
    /**
     * Enables caching dxf data into indexeddb.
     */
    enableLocalCache?: boolean;
    /**
     * Enables to merge objects.
     */
    enableMerge?: boolean;
    /**
     * File encoding, can be used by dxf. Common encoding include "UTF-8", "gb2312", etc.
     */
    encoding?: string;
    /**
     * Apply this color to everything in this model.
     * Color value between 0 and 1.
     */
    overrideColor?: number[];
    /**
     * Idealy, the thickness of lines in hatch pattern should always be 1 pixel.
     * In Viewer2d, it uses orthographic camera and always in top view,
     * so we adjust thickness by cameraZoom (and also consider worldScale).
     * While 3d view is more complex, it can use perspective camera,
     * its camera position and direction is flexible. We cannot keep line thickness
     * in a fixed pixel any more, and there is no proper way to adjust thickness as
     * position changes. So, we need to use a fixed thickness in world coordinates.
     */
    overrideHatchPatternLineThickness?: number;
}
/**
 * Dxf file loader.
 * @internal
 */
export declare class DxfLoader extends THREE.Loader {
    static readonly MODEL_LAYOUT_NAME = "Model";
    static readonly SNAP_GROUP_NAME = "InvisibleObjectGroupForOSnap";
    static readonly SHOW_SNAP_OBJECT = false;
    private timer;
    private ignorePaperSpace;
    font?: FontManager;
    private encoding;
    private overrideColor?;
    private overrideHatchPatternLineThickness?;
    angBase: number | IPoint;
    angDir: number | IPoint;
    private header;
    private pointsMaterials;
    private lineBasicMaterials;
    private lineShaderMaterials;
    private meshBasicMaterials;
    private meshTextureMaterials;
    private hatchShaderMaterials;
    private entityCount;
    private curveCount;
    private averageCurveSize;
    private enableRenderOrder;
    private enableLocalCache;
    private enableReleaseData;
    private enableMerge;
    private enableRTC;
    private enablePlineWidth;
    private dxfDataId;
    /**
     * Use a context in order to easily know if it is compare mode,
     * and, get compare result from it.
     */
    private compareContext?;
    private statsInfo;
    private blockReferencesCache;
    /**
     * Adds this data member just in order to improve the performence of getLayoutName.
     * Its key is blockrecord's handle, value is its layoutHandle.
     */
    private blockRecordsCache;
    /**
     * Adds this data member just in order to improve the performence of getLayoutName.
     * Its key is entity's handle, value is itself.
     */
    private entitiesCache;
    /**
     * Adds this data member just in order to improve the performence of getBlockByHandle.
     * Its key is block's ownerHandle, value is IBlock.
     */
    private blocksCache;
    /**
     * Adds this in order to improve performance of findSpatialFilterByHandle.
     * Key is dictionaryObject's ownerHandle(entity's handle), value is spatial filter's ownerHandle
     */
    private dictionaryOwnerHandleAndSpatialFilterHandlesCache;
    /**
     * Adds this in order to improve performance of findSpatialFilterByHandle.
     * Key is ISpatialFilterObject's ownerHandle, value is ISpatialFilterObject
     */
    private spatialFiltersCache;
    /**
     * Adds this in order to improve performance of creating threejs object
     * Key is entity's handle, value is threejs object.
     */
    private entityThreejsCache;
    private entityTypesAndTimes;
    private nonSnapableTypes;
    private layoutsSnapObjectsMap;
    /**
     * A flag to abort loading any dxf files, it aborts dxf compare progress too.
     * It doesn't support to abort one of the loader for now.
     */
    private aborted;
    static CameraZoomUniform: {
        value: number;
    };
    /**
     * Used for drawing dashed lines properly in a viewport.
     */
    static ViewportScaleUniform: {
        value: number;
    };
    static TransformMatrixUniform: {
        value: THREE.Matrix4;
    };
    static ResolutionUniform: {
        value: THREE.Vector2;
    };
    /**
     * WebGL has a limited capability for FragmentUniforms. Thus, cannot have as many
     * clippingPlanes as expected.
     */
    static MaxFragmentUniforms: number;
    /**
     * DxfLoader constructor
     */
    constructor(manager?: THREE.LoadingManager, cfg?: DxfLoaderConfig);
    /**
     * Sets font.
     */
    setFont(font: FontManager): void;
    /**
     * Downloads dxf file content
     */
    private download;
    /**
     * Loads a dxf file by given url.
     * If dxfDataId is specified and local cache is enabled, it firstly tries to load from cache.
     * @param url url of the dxf file
     * @param dxfDataId target dxf data id, used to get dxf data from cache if local cache is enabled.
     * @param onProgress on progress callback
     * @returns DxfData
     */
    loadEx(url: string, dxfDataId?: string, onProgress?: (event: ProgressEvent) => void): Promise<DxfData>;
    /**
     * Loads dxf asynchronously. It mainly contains 2 steps:
     * 1. Parses file content
     * 2. Generates/load threejs objects
     * @param url url of the dxf file
     * @param onProgress on progress callback
     */
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<DxfData>;
    /**
     * Parses dxf contents from given url.
     */
    parse(url: string, onProgress?: (event: ProgressEvent) => void): Promise<IDxf>;
    /**
     * Aborts loading or parsing progress if any.
     * We cann't resume any progress once aborted.
     * TODO: the abort logic is not well tested yet, need to be verified.
     */
    abort(): void;
    /**
     * If loading or parsing progress is aborted.
     */
    isAborted(): boolean;
    private parseHeader;
    /**
     * For some versions, the dxf file may be wired, missing header, objects, tables, etc.
     * We'll try to fill in missing content for it.
     */
    private tryFixDxfData;
    /**
     * Generates/load threejs objects according to the dxf data.
     * @param data
     * @param onProgress
     * @returns the promise of DxfData
     */
    loadEntities(data: IDxf, onProgress?: (event: ProgressEvent) => void): Promise<DxfData>;
    private getFontFilesFromDxf;
    /**
     * Loads entities from two dxf data for comparing.
     * It also generates DxfChange information for each change.
     */
    loadEntitiesForCompare(data1: IDxf, data2: IDxf, changes: Record<string, DxfChange>, bIgnoreSameEntity?: boolean, onProgress?: (event: ProgressEvent) => void): Promise<void>;
    private setObjectColorByChange;
    /**
     * Manually release some objects to save memory.
     */
    private releaseCachedData;
    /**
     * Releases memory-costy elements of an entity
     */
    private releaseEntity;
    /**
     * Releases memory-costy elements of dxf data
     */
    private releaseDxfData;
    /**
     * We'll need to pass in the blockEntity when loadEntity is called from a block.
     * So that, when an entity's color is ByLayer, and its layer is "0", it should use block's layer,
     * rather than the layer of the entity itself!
     * We don't know if there is other similar case in future, so pass in blockEntity here.
     */
    loadEntity(entity: DxfEntity, data: IDxf, parentEntity?: IEntity, isParentChanged?: boolean): DxfObject | undefined;
    private loadEllipse;
    private loadMText;
    private getMTextGroup;
    private mtextContentAndFormattingToTextAndStyle;
    private getTextLineNum;
    private load3DFace;
    private loadSpline;
    private loadXLine;
    private loadRay;
    private loadLine;
    private loadLWPolyline;
    private loadMLeader;
    private loadLeader;
    private getTableTextOffset;
    private loadTable;
    private loadDefaultLeadArrow;
    private getBlockByHandle;
    static updateMaterialUniforms(material: THREE.Material): void;
    static transformAngleByOcsMatrix(ocsMatrix: THREE.Matrix4, angle: number): number;
    static getArcAnglesByOcsMatrix(ocsMatrix: THREE.Matrix4, startAngle: number, endAngle: number): number[];
    private loadArc;
    private addTriangleFacingCamera;
    private loadSolid;
    private getTextStyle;
    private getDefaultDimensionStyle;
    private getTextEncoding;
    private getTextMesh;
    private createTextMeshByText;
    private transformTextMesh;
    private loadText;
    private loadAttDef;
    private loadAttrib;
    private loadPoint;
    private loadDimension;
    private loadImage;
    private loadInsert;
    private loadSpatialFilter;
    private loadLayout;
    private convertEdgeToPoints;
    private loadHatch;
    private loadOle2frame;
    private static getOcsMatrix;
    static getDcs2WcsMatrix(viewportEntity: IViewportEntity | IViewport, angDir: number): THREE.Matrix4;
    private getViewportMsToPsMatrix;
    private loadViewport;
    private getColor;
    private getLineType;
    /**
     * Gets entity's layer name.
     * Note that, when entity is in layer "0", it tries to get its parent blockEntity's layer name.
     */
    private getLayerName;
    /**
     * Sets object's material after being created
     * TODO: hatch is handled separately, and may move its logic here.
     */
    private setMaterial;
    private setHatchMaterial;
    private setRenderOrderByObjectType;
    private getPointsMaterial;
    private getLineBasicMaterial;
    private getLineShaderMaterial;
    private getMeshBasicMaterial;
    /**
     * Gets shader material for drawing a hatch with pattern
     */
    private getHatchShaderMaterial;
    /**
     * Gets a proper division for curve by entity count, entity size and theta angle, etc.
     * @param size may not be accurate, can be the radius, long size of bbox, etc.
     */
    private getDivision;
    /**
     * Gets a proper interpolation for bspline.
     * A bigger interpolation value generates smooth bspline, but with a bad performance, so we need to limit this value.
     * @param pointCount control point count
     * @param size may not be accurate, can be the long side of bbox, etc.
     */
    getBSplineInterpolationsPerSplineSegment(pointCount: number, size: number): number;
    /**
     * Gets proper simplify tolerance.
     * If tolerance is bigger, more points are simpified.
     */
    /**
     * Catches dxf data into indexedDb
     */
    private setDxfDataToIndexedDb;
    /**
     * Gets dxf data into indexedDb
     */
    private getDxfDataFromIndexedDb;
    private buildContainHierarchyTree;
    private buildHatchGeometry;
    private findIntersectHole;
    /**
     * Checks if we should rebase points in case their values are big, and do rebase if necessary
     */
    private checkAndRebasePolygonsOnRTC;
    /**
     * Adds "relativeToCenter" flag to indicate an object has been rebased
     */
    private setRTCUserData;
    private IsfilteredByPathTypeFlag;
    /**
     * Finds spatial filter by entity handle.
     */
    private findSpatialFilterByHandle;
    private entityHandlesWithRenderOrder;
    /**
     * Find out render order info from SortEntsTable.
     */
    private initRenderOrderInfo;
    private findMatchedHatchShaderMaterial;
    private addViewport;
    /**
     * Gets the layout that entity belongs to.
     * Entities resident in two places:
     * 1) IDxf.entities
     * 2) IDxf.blocks[<blockName>].entities
     */
    private getLayout;
    private getLayerVisible;
    private getLayerFrozen;
    private cloneMaterialsForSpatialFilter;
    private getLineTypeScales;
    static getDxfUnits(unitValue: number): Units;
    static computeLineDistance(line: THREE.Line): void;
    static computeLineDistances(object: THREE.Object3D): void;
    private static mergeDxfObjects;
    /**
     * Merges objects by layer and layout.
     */
    static merge(dxfData: DxfData, onProgress?: (event: ProgressEvent) => void): Promise<void>;
    /**
     * Prints stats info for debugging
     */
    private printStatsInfo;
    private static statLayoutAndLayerObjects;
    /**
     * First marks the objects to be removed from bottom to top,
     * and then removes empty objects from top to bottom
     */
    private static removeEmptyObjectsFromRemovingMarkedObjects;
    private static removeEmptyObjectsFromMark;
    /**
     * First marks the objects to be removed from bottom to top,
     * and then removes empty objects from top to bottom
     */
    private static removeEmptyObjectsFromRemovingMarkedObjects2;
    private static removeEmptyObjectsFromMark2;
}

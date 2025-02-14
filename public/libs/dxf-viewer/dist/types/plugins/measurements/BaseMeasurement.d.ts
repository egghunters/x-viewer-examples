import * as THREE from "three";
import type { BaseMeasureDrawable } from "./BaseMeasureDrawable";
import { Tooltip } from "../../components/tool-tip";
import { DrawableData } from "../../core/canvas/Constants";
import { DrawableList } from "../../core/canvas/DrawableList";
import type { MobileTouchHelperDrawable, OSnapHelper } from "../../core/helpers";
import { EventInfo, InputManager } from "../../core/input-manager/InputManager";
import { Event } from "../../core/utils";
import type { BaseViewer } from "../../core/viewers";
/**
 * Measurement type. e.g. distance measurement, area measurement, etc.
 */
export declare enum MeasurementType {
    Distance = "Distance",
    Area = "Area",
    Angle = "Angle",
    /**
     * @internal
     */
    Coordinate = "Coordinate"
}
/**
 * Serializable measurement data
 */
export type MeasurementData = DrawableData;
/**
 * Measurement events.
 */
type MeasurementEvents = {
    /**
     * Triggered when clicked on a measurement drawable.
     */
    onclick: BaseMeasureDrawable;
    /**
     * Triggered when a measurement is completed.
     * At this time, user may continue to do another measurement.
     */
    complete: BaseMeasureDrawable;
    /**
     * Triggered when measurement is deactivated.
     */
    deactivate: MeasurementType;
    /**
     * Triggered when the first point is drawn.
     * We need this event to unselect a selected drawable, etc.
     */
    firstpointpicked: BaseMeasureDrawable;
    /**
     * Triggered before a drawable is added.
     */
    beforeadd: BaseMeasureDrawable;
    /**
     * Triggered when a drawable is updated.
     */
    update: BaseMeasureDrawable;
    /**
     * Triggered before a drawable is removed.
     */
    beforeremove: BaseMeasureDrawable;
};
/**
 * BaseMeasurement class
 */
export declare abstract class BaseMeasurement extends Event<MeasurementEvents> {
    protected type: MeasurementType;
    protected viewer: BaseViewer;
    private inputManager;
    protected drawList: DrawableList;
    protected osnapHelper: OSnapHelper;
    protected actived: boolean;
    protected mouseMoved: boolean;
    protected mouseDowned: boolean;
    protected touchDowned: boolean;
    protected lastMoveEvent?: EventInfo;
    protected lastMouseDownPosition?: THREE.Vector3;
    protected mouseDownPositionX: number;
    protected mouseDownPositionY: number;
    protected currentMeasureDrawable?: BaseMeasureDrawable;
    protected drawingPoints?: THREE.Vector3[];
    protected lastClickTime?: number;
    protected tooltip?: Tooltip;
    protected snapPoint?: THREE.Vector3 | undefined;
    protected completed?: boolean;
    protected clickedOnMeasurementDrawable?: BaseMeasureDrawable;
    protected mobileTouchHelper?: MobileTouchHelperDrawable;
    protected exitButton?: HTMLButtonElement;
    protected firstPickedListener?: () => void;
    protected completedListener?: () => void;
    constructor(type: MeasurementType, viewer: BaseViewer, input: InputManager, drawList: DrawableList, osnapHelper: OSnapHelper);
    get overlayRender(): import("../..").CanvasRender;
    get renderer(): THREE.WebGLRenderer;
    /**
     * If measurement is active.
     * Here let's use raycaster to identify whether this measurement is active.
     */
    get isActive(): boolean;
    /**
     * If it started to measure, but a measruement action is not completed yet.
     */
    get isMeasuring(): boolean;
    setTouchHelper(mobileTouchHelper: MobileTouchHelperDrawable): void;
    protected createMobileExitButton(): HTMLButtonElement;
    activate(): void;
    deactivate(): void;
    protected removeDrawable(drawable: BaseMeasureDrawable): void;
    clearClickedDrawable(): void;
    touchstart: (e: EventInfo) => void;
    touchmove: (e: EventInfo) => void;
    touchend: (e: EventInfo) => void;
    mousedown: (e: EventInfo) => void;
    mousemove: (e: EventInfo) => void;
    mouseup: (e: EventInfo) => void;
    dblclick: () => void;
    protected onMouseClick(e: EventInfo): void;
    protected selectMeasurementByEvent(e: EventInfo): void;
    keydown: (e: EventInfo) => void;
    abstract exitDrawing(): void;
    abstract cancel(): void;
    protected abstract complete(): void;
    protected abstract setTooltipContent(): void;
    protected abstract createMeasureDrawable(): BaseMeasureDrawable | undefined;
    protected onMouseMove(position: THREE.Vector3): void;
    protected createOrUpdateMeasureDrawable(position?: THREE.Vector3): void;
    /**
     * The closest intersection
     * @param e
     */
    getIntersections: (e: EventInfo) => THREE.Intersection[];
}
export {};

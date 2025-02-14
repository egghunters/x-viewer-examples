import { Event } from "../../core/utils";
type NativeEvent = UIEvent | MouseEvent | PointerEvent | WheelEvent | KeyboardEvent;
export interface IUIEvent {
    readonly type: string;
    readonly target: any;
    readonly preventDefault: () => void;
}
export interface IMouseEvent extends IUIEvent {
    readonly altKey: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly button: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly pageX: number;
    readonly pageY: number;
    readonly x: number;
    readonly y: number;
    readonly timestamp: number;
}
export interface IPointerEvent extends IMouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
}
export interface IWheelEvent extends IMouseEvent {
    readonly deltaMode: number;
    readonly deltaX: number;
    readonly deltaY: number;
    readonly deltaZ: number;
}
export interface IKeyboardEvent extends IUIEvent {
    readonly altKey: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly key: string;
    readonly code: string;
}
export declare enum MouseButton {
    /** Left Click or Touch */
    Left = 0,
    /** Middle Click */
    Middle = 1,
    /** Right Click */
    Right = 2,
    /** Browser Back */
    Back = 3,
    /** Browser Forward */
    Forward = 4
}
type MouseButtonType = MouseButton;
/**
 * Event info.
 */
export interface EventInfo {
    x: number;
    y: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
    deltaMode: number;
    deltaX: number;
    deltaY: number;
    movementX: number;
    movementY: number;
    code?: string;
    pointerId: number;
    pointers?: EventInfo[];
    button?: MouseButtonType;
    buttons: MouseButtonType;
    pointerType: string;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    timestamp: number;
    originalEvent?: NativeEvent;
}
/**
 * Input events.
 */
export type InputEvents = {
    pointerdown: EventInfo;
    pointermove: EventInfo;
    pointerup: EventInfo;
    pointercancel: EventInfo;
    pointerenter: EventInfo;
    pointerleave: EventInfo;
    wheel: EventInfo;
    click: EventInfo;
    dblclick: EventInfo;
    contextmenu: EventInfo;
    mousedown: EventInfo;
    mousemove: EventInfo;
    mouseup: EventInfo;
    touchstart: EventInfo;
    touchmove: EventInfo;
    touchend: EventInfo;
    keydown: EventInfo;
    keyup: EventInfo;
    resize: EventInfo;
};
export declare class InputManager extends Event<InputEvents> {
    private element;
    private enabled;
    private keyboardEnabled;
    protected mouseDownPositionX: number;
    protected mouseDownPositionY: number;
    protected lastLeftPointerUpTime: number;
    private pointers;
    constructor(element: HTMLElement);
    getEnabled(): boolean;
    setEnabled(enable: boolean): void;
    getkKeyboardEnabled(): boolean;
    setkKeyboardEnabled(enable: boolean): void;
    setCursor(cursorStyle: string): void;
    bindEvents(): void;
    private handleClick;
    private handlePointerDown;
    private handlePointerMove;
    private handlePointerUp;
    private handlePointerCancel;
    private handleMouseWheel;
    private handleContextMenu;
    private handlePointerEnter;
    private handlePointerLeave;
    private handleResize;
    private handleKeydown;
    private handleKeyup;
    unBindEvents(): void;
    private getBaseEvent;
    private stop;
    private updatePointers;
    private removePointers;
    style: {};
    getBoundingClientRect(): DOMRect;
    /**
     * Checks if user clicked on last position, this is used to detect a dblclick event.
     */
    private isCloseToLastPosition;
    /**
     * Checks if a dblclick event happen.
     */
    private isDoubleClick;
}
export {};

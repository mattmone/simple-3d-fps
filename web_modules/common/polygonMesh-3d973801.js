import { V as VertexData, M as Mesh, H as HemisphericLight, q as PointerInfo, S as Scene, P as PointerEventTypes } from './standardMaterial-cad1cb30.js';
import { b as __extends, L as Logger, Z as Texture, C as Constants, V as Vector3, l as Color3, E as EngineStore, O as Observable, h as Vector4, i as Color4, W as SceneComponentConstants, Y as Effect, g as VertexBuffer, J as Material, j as Vector2, aC as Path2, m as Engine } from './texture-1533b140.js';

/**
 * A behavior that when attached to a mesh will allow the mesh to fade in and out
 */
var FadeInOutBehavior = /** @class */ (function () {
    /**
     * Instatiates the FadeInOutBehavior
     */
    function FadeInOutBehavior() {
        var _this = this;
        /**
         * Time in milliseconds to delay before fading in (Default: 0)
         */
        this.delay = 0;
        /**
         * Time in milliseconds for the mesh to fade in (Default: 300)
         */
        this.fadeInTime = 300;
        this._millisecondsPerFrame = 1000 / 60;
        this._hovered = false;
        this._hoverValue = 0;
        this._ownerNode = null;
        this._update = function () {
            if (_this._ownerNode) {
                _this._hoverValue += _this._hovered ? _this._millisecondsPerFrame : -_this._millisecondsPerFrame;
                _this._setAllVisibility(_this._ownerNode, (_this._hoverValue - _this.delay) / _this.fadeInTime);
                if (_this._ownerNode.visibility > 1) {
                    _this._setAllVisibility(_this._ownerNode, 1);
                    _this._hoverValue = _this.fadeInTime + _this.delay;
                    return;
                }
                else if (_this._ownerNode.visibility < 0) {
                    _this._setAllVisibility(_this._ownerNode, 0);
                    if (_this._hoverValue < 0) {
                        _this._hoverValue = 0;
                        return;
                    }
                }
                setTimeout(_this._update, _this._millisecondsPerFrame);
            }
        };
    }
    Object.defineProperty(FadeInOutBehavior.prototype, "name", {
        /**
         *  The name of the behavior
         */
        get: function () {
            return "FadeInOut";
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  Initializes the behavior
     */
    FadeInOutBehavior.prototype.init = function () {
    };
    /**
     * Attaches the fade behavior on the passed in mesh
     * @param ownerNode The mesh that will be faded in/out once attached
     */
    FadeInOutBehavior.prototype.attach = function (ownerNode) {
        this._ownerNode = ownerNode;
        this._setAllVisibility(this._ownerNode, 0);
    };
    /**
     *  Detaches the behavior from the mesh
     */
    FadeInOutBehavior.prototype.detach = function () {
        this._ownerNode = null;
    };
    /**
     * Triggers the mesh to begin fading in or out
     * @param value if the object should fade in or out (true to fade in)
     */
    FadeInOutBehavior.prototype.fadeIn = function (value) {
        this._hovered = value;
        this._update();
    };
    FadeInOutBehavior.prototype._setAllVisibility = function (mesh, value) {
        var _this = this;
        mesh.visibility = value;
        mesh.getChildMeshes().forEach(function (c) {
            _this._setAllVisibility(c, value);
        });
    };
    return FadeInOutBehavior;
}());

VertexData.CreatePlane = function (options) {
    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var width = options.width || options.size || 1;
    var height = options.height || options.size || 1;
    var sideOrientation = (options.sideOrientation === 0) ? 0 : options.sideOrientation || VertexData.DEFAULTSIDE;
    // Vertices
    var halfWidth = width / 2.0;
    var halfHeight = height / 2.0;
    positions.push(-halfWidth, -halfHeight, 0);
    normals.push(0, 0, -1.0);
    uvs.push(0.0, 0.0);
    positions.push(halfWidth, -halfHeight, 0);
    normals.push(0, 0, -1.0);
    uvs.push(1.0, 0.0);
    positions.push(halfWidth, halfHeight, 0);
    normals.push(0, 0, -1.0);
    uvs.push(1.0, 1.0);
    positions.push(-halfWidth, halfHeight, 0);
    normals.push(0, 0, -1.0);
    uvs.push(0.0, 1.0);
    // Indices
    indices.push(0);
    indices.push(1);
    indices.push(2);
    indices.push(0);
    indices.push(2);
    indices.push(3);
    // Sides
    VertexData._ComputeSides(sideOrientation, positions, indices, normals, uvs, options.frontUVs, options.backUVs);
    // Result
    var vertexData = new VertexData();
    vertexData.indices = indices;
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    return vertexData;
};
Mesh.CreatePlane = function (name, size, scene, updatable, sideOrientation) {
    var options = {
        size: size,
        width: size,
        height: size,
        sideOrientation: sideOrientation,
        updatable: updatable
    };
    return PlaneBuilder.CreatePlane(name, options, scene);
};
/**
 * Class containing static functions to help procedurally build meshes
 */
var PlaneBuilder = /** @class */ (function () {
    function PlaneBuilder() {
    }
    /**
     * Creates a plane mesh
     * * The parameter `size` sets the size (float) of both sides of the plane at once (default 1)
     * * You can set some different plane dimensions by using the parameters `width` and `height` (both by default have the same value of `size`)
     * * The parameter `sourcePlane` is a Plane instance. It builds a mesh plane from a Math plane
     * * You can also set the mesh side orientation with the values : BABYLON.Mesh.FRONTSIDE (default), BABYLON.Mesh.BACKSIDE or BABYLON.Mesh.DOUBLESIDE
     * * If you create a double-sided mesh, you can choose what parts of the texture image to crop and stick respectively on the front and the back sides with the parameters `frontUVs` and `backUVs` (Vector4). Detail here : https://doc.babylonjs.com/babylon101/discover_basic_elements#side-orientation
     * * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created
     * @param name defines the name of the mesh
     * @param options defines the options used to create the mesh
     * @param scene defines the hosting scene
     * @returns the plane mesh
     * @see https://doc.babylonjs.com/how_to/set_shapes#plane
     */
    PlaneBuilder.CreatePlane = function (name, options, scene) {
        if (scene === void 0) { scene = null; }
        var plane = new Mesh(name, scene);
        options.sideOrientation = Mesh._GetDefaultSideOrientation(options.sideOrientation);
        plane._originalBuilderSideOrientation = options.sideOrientation;
        var vertexData = VertexData.CreatePlane(options);
        vertexData.applyToMesh(plane, options.updatable);
        if (options.sourcePlane) {
            plane.translate(options.sourcePlane.normal, -options.sourcePlane.d);
            plane.setDirection(options.sourcePlane.normal.scale(-1));
        }
        return plane;
    };
    return PlaneBuilder;
}());

/**
 * A class extending Texture allowing drawing on a texture
 * @see http://doc.babylonjs.com/how_to/dynamictexture
 */
var DynamicTexture = /** @class */ (function (_super) {
    __extends(DynamicTexture, _super);
    /**
     * Creates a DynamicTexture
     * @param name defines the name of the texture
     * @param options provides 3 alternatives for width and height of texture, a canvas, object with width and height properties, number for both width and height
     * @param scene defines the scene where you want the texture
     * @param generateMipMaps defines the use of MinMaps or not (default is false)
     * @param samplingMode defines the sampling mode to use (default is Texture.TRILINEAR_SAMPLINGMODE)
     * @param format defines the texture format to use (default is Engine.TEXTUREFORMAT_RGBA)
     */
    function DynamicTexture(name, options, scene, generateMipMaps, samplingMode, format) {
        if (scene === void 0) { scene = null; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        if (format === void 0) { format = Constants.TEXTUREFORMAT_RGBA; }
        var _this = _super.call(this, null, scene, !generateMipMaps, undefined, samplingMode, undefined, undefined, undefined, undefined, format) || this;
        _this.name = name;
        _this._engine = _this.getScene().getEngine();
        _this.wrapU = Texture.CLAMP_ADDRESSMODE;
        _this.wrapV = Texture.CLAMP_ADDRESSMODE;
        _this._generateMipMaps = generateMipMaps;
        if (options.getContext) {
            _this._canvas = options;
            _this._texture = _this._engine.createDynamicTexture(options.width, options.height, generateMipMaps, samplingMode);
        }
        else {
            _this._canvas = document.createElement("canvas");
            if (options.width || options.width === 0) {
                _this._texture = _this._engine.createDynamicTexture(options.width, options.height, generateMipMaps, samplingMode);
            }
            else {
                _this._texture = _this._engine.createDynamicTexture(options, options, generateMipMaps, samplingMode);
            }
        }
        var textureSize = _this.getSize();
        _this._canvas.width = textureSize.width;
        _this._canvas.height = textureSize.height;
        _this._context = _this._canvas.getContext("2d");
        return _this;
    }
    /**
     * Get the current class name of the texture useful for serialization or dynamic coding.
     * @returns "DynamicTexture"
     */
    DynamicTexture.prototype.getClassName = function () {
        return "DynamicTexture";
    };
    Object.defineProperty(DynamicTexture.prototype, "canRescale", {
        /**
         * Gets the current state of canRescale
         */
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    DynamicTexture.prototype._recreate = function (textureSize) {
        this._canvas.width = textureSize.width;
        this._canvas.height = textureSize.height;
        this.releaseInternalTexture();
        this._texture = this._engine.createDynamicTexture(textureSize.width, textureSize.height, this._generateMipMaps, this.samplingMode);
    };
    /**
     * Scales the texture
     * @param ratio the scale factor to apply to both width and height
     */
    DynamicTexture.prototype.scale = function (ratio) {
        var textureSize = this.getSize();
        textureSize.width *= ratio;
        textureSize.height *= ratio;
        this._recreate(textureSize);
    };
    /**
     * Resizes the texture
     * @param width the new width
     * @param height the new height
     */
    DynamicTexture.prototype.scaleTo = function (width, height) {
        var textureSize = this.getSize();
        textureSize.width = width;
        textureSize.height = height;
        this._recreate(textureSize);
    };
    /**
     * Gets the context of the canvas used by the texture
     * @returns the canvas context of the dynamic texture
     */
    DynamicTexture.prototype.getContext = function () {
        return this._context;
    };
    /**
     * Clears the texture
     */
    DynamicTexture.prototype.clear = function () {
        var size = this.getSize();
        this._context.fillRect(0, 0, size.width, size.height);
    };
    /**
     * Updates the texture
     * @param invertY defines the direction for the Y axis (default is true - y increases downwards)
     * @param premulAlpha defines if alpha is stored as premultiplied (default is false)
     */
    DynamicTexture.prototype.update = function (invertY, premulAlpha) {
        if (premulAlpha === void 0) { premulAlpha = false; }
        this._engine.updateDynamicTexture(this._texture, this._canvas, invertY === undefined ? true : invertY, premulAlpha, this._format || undefined);
    };
    /**
     * Draws text onto the texture
     * @param text defines the text to be drawn
     * @param x defines the placement of the text from the left
     * @param y defines the placement of the text from the top when invertY is true and from the bottom when false
     * @param font defines the font to be used with font-style, font-size, font-name
     * @param color defines the color used for the text
     * @param clearColor defines the color for the canvas, use null to not overwrite canvas
     * @param invertY defines the direction for the Y axis (default is true - y increases downwards)
     * @param update defines whether texture is immediately update (default is true)
     */
    DynamicTexture.prototype.drawText = function (text, x, y, font, color, clearColor, invertY, update) {
        if (update === void 0) { update = true; }
        var size = this.getSize();
        if (clearColor) {
            this._context.fillStyle = clearColor;
            this._context.fillRect(0, 0, size.width, size.height);
        }
        this._context.font = font;
        if (x === null || x === undefined) {
            var textSize = this._context.measureText(text);
            x = (size.width - textSize.width) / 2;
        }
        if (y === null || y === undefined) {
            var fontSize = parseInt((font.replace(/\D/g, '')));
            y = (size.height / 2) + (fontSize / 3.65);
        }
        this._context.fillStyle = color;
        this._context.fillText(text, x, y);
        if (update) {
            this.update(invertY);
        }
    };
    /**
     * Clones the texture
     * @returns the clone of the texture.
     */
    DynamicTexture.prototype.clone = function () {
        var scene = this.getScene();
        if (!scene) {
            return this;
        }
        var textureSize = this.getSize();
        var newTexture = new DynamicTexture(this.name, textureSize, scene, this._generateMipMaps);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // Dynamic Texture
        newTexture.wrapU = this.wrapU;
        newTexture.wrapV = this.wrapV;
        return newTexture;
    };
    /**
     * Serializes the dynamic texture.  The scene should be ready before the dynamic texture is serialized
     * @returns a serialized dynamic texture object
     */
    DynamicTexture.prototype.serialize = function () {
        var scene = this.getScene();
        if (scene && !scene.isReady()) {
            Logger.Warn("The scene must be ready before serializing the dynamic texture");
        }
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.base64String = this._canvas.toDataURL();
        serializationObject.invertY = this._invertY;
        serializationObject.samplingMode = this.samplingMode;
        return serializationObject;
    };
    /** @hidden */
    DynamicTexture.prototype._rebuild = function () {
        this.update();
    };
    return DynamicTexture;
}(Texture));

/**
 * Renders a layer on top of an existing scene
 */
var UtilityLayerRenderer = /** @class */ (function () {
    /**
     * Instantiates a UtilityLayerRenderer
     * @param originalScene the original scene that will be rendered on top of
     * @param handleEvents boolean indicating if the utility layer should handle events
     */
    function UtilityLayerRenderer(
    /** the original scene that will be rendered on top of */
    originalScene, handleEvents) {
        var _this = this;
        if (handleEvents === void 0) { handleEvents = true; }
        this.originalScene = originalScene;
        this._pointerCaptures = {};
        this._lastPointerEvents = {};
        this._sharedGizmoLight = null;
        /**
         * If the picking should be done on the utility layer prior to the actual scene (Default: true)
         */
        this.pickUtilitySceneFirst = true;
        /**
         *  If the utility layer should automatically be rendered on top of existing scene
        */
        this.shouldRender = true;
        /**
         * If set to true, only pointer down onPointerObservable events will be blocked when picking is occluded by original scene
         */
        this.onlyCheckPointerDownEvents = true;
        /**
         * If set to false, only pointerUp, pointerDown and pointerMove will be sent to the utilityLayerScene (false by default)
         */
        this.processAllEvents = false;
        /**
         * Observable raised when the pointer move from the utility layer scene to the main scene
         */
        this.onPointerOutObservable = new Observable();
        // Create scene which will be rendered in the foreground and remove it from being referenced by engine to avoid interfering with existing app
        this.utilityLayerScene = new Scene(originalScene.getEngine(), { virtual: true });
        this.utilityLayerScene.useRightHandedSystem = originalScene.useRightHandedSystem;
        this.utilityLayerScene._allowPostProcessClearColor = false;
        // Detach controls on utility scene, events will be fired by logic below to handle picking priority
        this.utilityLayerScene.detachControl();
        if (handleEvents) {
            this._originalPointerObserver = originalScene.onPrePointerObservable.add(function (prePointerInfo, eventState) {
                if (!_this.utilityLayerScene.activeCamera) {
                    return;
                }
                if (!_this.processAllEvents) {
                    if (prePointerInfo.type !== PointerEventTypes.POINTERMOVE
                        && prePointerInfo.type !== PointerEventTypes.POINTERUP
                        && prePointerInfo.type !== PointerEventTypes.POINTERDOWN) {
                        return;
                    }
                }
                _this.utilityLayerScene.pointerX = originalScene.pointerX;
                _this.utilityLayerScene.pointerY = originalScene.pointerY;
                var pointerEvent = (prePointerInfo.event);
                if (originalScene.isPointerCaptured(pointerEvent.pointerId)) {
                    _this._pointerCaptures[pointerEvent.pointerId] = false;
                    return;
                }
                var utilityScenePick = prePointerInfo.ray ? _this.utilityLayerScene.pickWithRay(prePointerInfo.ray) : _this.utilityLayerScene.pick(originalScene.pointerX, originalScene.pointerY);
                if (!prePointerInfo.ray && utilityScenePick) {
                    prePointerInfo.ray = utilityScenePick.ray;
                }
                // always fire the prepointer oversvable
                _this.utilityLayerScene.onPrePointerObservable.notifyObservers(prePointerInfo);
                // allow every non pointer down event to flow to the utility layer
                if (_this.onlyCheckPointerDownEvents && prePointerInfo.type != PointerEventTypes.POINTERDOWN) {
                    if (!prePointerInfo.skipOnPointerObservable) {
                        _this.utilityLayerScene.onPointerObservable.notifyObservers(new PointerInfo(prePointerInfo.type, prePointerInfo.event, utilityScenePick));
                    }
                    if (prePointerInfo.type === PointerEventTypes.POINTERUP && _this._pointerCaptures[pointerEvent.pointerId]) {
                        _this._pointerCaptures[pointerEvent.pointerId] = false;
                    }
                    return;
                }
                if (_this.utilityLayerScene.autoClearDepthAndStencil || _this.pickUtilitySceneFirst) {
                    // If this layer is an overlay, check if this layer was hit and if so, skip pointer events for the main scene
                    if (utilityScenePick && utilityScenePick.hit) {
                        if (!prePointerInfo.skipOnPointerObservable) {
                            _this.utilityLayerScene.onPointerObservable.notifyObservers(new PointerInfo(prePointerInfo.type, prePointerInfo.event, utilityScenePick));
                        }
                        prePointerInfo.skipOnPointerObservable = true;
                    }
                }
                else {
                    var originalScenePick = prePointerInfo.ray ? originalScene.pickWithRay(prePointerInfo.ray) : originalScene.pick(originalScene.pointerX, originalScene.pointerY);
                    var pointerEvent_1 = (prePointerInfo.event);
                    // If the layer can be occluded by the original scene, only fire pointer events to the first layer that hit they ray
                    if (originalScenePick && utilityScenePick) {
                        // No pick in utility scene
                        if (utilityScenePick.distance === 0 && originalScenePick.pickedMesh) {
                            if (_this.mainSceneTrackerPredicate && _this.mainSceneTrackerPredicate(originalScenePick.pickedMesh)) {
                                // We touched an utility mesh present in the main scene
                                _this._notifyObservers(prePointerInfo, originalScenePick, pointerEvent_1);
                                prePointerInfo.skipOnPointerObservable = true;
                            }
                            else if (prePointerInfo.type === PointerEventTypes.POINTERDOWN) {
                                _this._pointerCaptures[pointerEvent_1.pointerId] = true;
                            }
                            else if (_this._lastPointerEvents[pointerEvent_1.pointerId]) {
                                // We need to send a last pointerup to the utilityLayerScene to make sure animations can complete
                                _this.onPointerOutObservable.notifyObservers(pointerEvent_1.pointerId);
                                delete _this._lastPointerEvents[pointerEvent_1.pointerId];
                            }
                        }
                        else if (!_this._pointerCaptures[pointerEvent_1.pointerId] && (utilityScenePick.distance < originalScenePick.distance || originalScenePick.distance === 0)) {
                            // We pick something in utility scene or the pick in utility is closer than the one in main scene
                            _this._notifyObservers(prePointerInfo, utilityScenePick, pointerEvent_1);
                            // If a previous utility layer set this, do not unset this
                            if (!prePointerInfo.skipOnPointerObservable) {
                                prePointerInfo.skipOnPointerObservable = utilityScenePick.distance > 0;
                            }
                        }
                        else if (!_this._pointerCaptures[pointerEvent_1.pointerId] && (utilityScenePick.distance > originalScenePick.distance)) {
                            // We have a pick in both scenes but main is closer than utility
                            // We touched an utility mesh present in the main scene
                            if (_this.mainSceneTrackerPredicate && _this.mainSceneTrackerPredicate(originalScenePick.pickedMesh)) {
                                _this._notifyObservers(prePointerInfo, originalScenePick, pointerEvent_1);
                                prePointerInfo.skipOnPointerObservable = true;
                            }
                            else if (_this._lastPointerEvents[pointerEvent_1.pointerId]) {
                                // We need to send a last pointerup to the utilityLayerScene to make sure animations can complete
                                _this.onPointerOutObservable.notifyObservers(pointerEvent_1.pointerId);
                                delete _this._lastPointerEvents[pointerEvent_1.pointerId];
                            }
                        }
                        if (prePointerInfo.type === PointerEventTypes.POINTERUP && _this._pointerCaptures[pointerEvent_1.pointerId]) {
                            _this._pointerCaptures[pointerEvent_1.pointerId] = false;
                        }
                    }
                }
            });
            // As a newly added utility layer will be rendered over the screen last, it's pointer events should be processed first
            if (this._originalPointerObserver) {
                originalScene.onPrePointerObservable.makeObserverTopPriority(this._originalPointerObserver);
            }
        }
        // Render directly on top of existing scene without clearing
        this.utilityLayerScene.autoClear = false;
        this._afterRenderObserver = this.originalScene.onAfterRenderObservable.add(function () {
            if (_this.shouldRender) {
                _this.render();
            }
        });
        this._sceneDisposeObserver = this.originalScene.onDisposeObservable.add(function () {
            _this.dispose();
        });
        this._updateCamera();
    }
    /**
     * @hidden
     * Light which used by gizmos to get light shading
     */
    UtilityLayerRenderer.prototype._getSharedGizmoLight = function () {
        if (!this._sharedGizmoLight) {
            this._sharedGizmoLight = new HemisphericLight("shared gizmo light", new Vector3(0, 1, 0), this.utilityLayerScene);
            this._sharedGizmoLight.intensity = 2;
            this._sharedGizmoLight.groundColor = Color3.Gray();
        }
        return this._sharedGizmoLight;
    };
    Object.defineProperty(UtilityLayerRenderer, "DefaultUtilityLayer", {
        /**
         * A shared utility layer that can be used to overlay objects into a scene (Depth map of the previous scene is cleared before drawing on top of it)
         */
        get: function () {
            if (UtilityLayerRenderer._DefaultUtilityLayer == null) {
                UtilityLayerRenderer._DefaultUtilityLayer = new UtilityLayerRenderer(EngineStore.LastCreatedScene);
                UtilityLayerRenderer._DefaultUtilityLayer.originalScene.onDisposeObservable.addOnce(function () {
                    UtilityLayerRenderer._DefaultUtilityLayer = null;
                });
            }
            return UtilityLayerRenderer._DefaultUtilityLayer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UtilityLayerRenderer, "DefaultKeepDepthUtilityLayer", {
        /**
         * A shared utility layer that can be used to embed objects into a scene (Depth map of the previous scene is not cleared before drawing on top of it)
         */
        get: function () {
            if (UtilityLayerRenderer._DefaultKeepDepthUtilityLayer == null) {
                UtilityLayerRenderer._DefaultKeepDepthUtilityLayer = new UtilityLayerRenderer(EngineStore.LastCreatedScene);
                UtilityLayerRenderer._DefaultKeepDepthUtilityLayer.utilityLayerScene.autoClearDepthAndStencil = false;
                UtilityLayerRenderer._DefaultKeepDepthUtilityLayer.originalScene.onDisposeObservable.addOnce(function () {
                    UtilityLayerRenderer._DefaultKeepDepthUtilityLayer = null;
                });
            }
            return UtilityLayerRenderer._DefaultKeepDepthUtilityLayer;
        },
        enumerable: true,
        configurable: true
    });
    UtilityLayerRenderer.prototype._notifyObservers = function (prePointerInfo, pickInfo, pointerEvent) {
        if (!prePointerInfo.skipOnPointerObservable) {
            this.utilityLayerScene.onPointerObservable.notifyObservers(new PointerInfo(prePointerInfo.type, prePointerInfo.event, pickInfo));
            this._lastPointerEvents[pointerEvent.pointerId] = true;
        }
    };
    /**
     * Renders the utility layers scene on top of the original scene
     */
    UtilityLayerRenderer.prototype.render = function () {
        this._updateCamera();
        if (this.utilityLayerScene.activeCamera) {
            // Set the camera's scene to utility layers scene
            var oldScene = this.utilityLayerScene.activeCamera.getScene();
            var camera = this.utilityLayerScene.activeCamera;
            camera._scene = this.utilityLayerScene;
            if (camera.leftCamera) {
                camera.leftCamera._scene = this.utilityLayerScene;
            }
            if (camera.rightCamera) {
                camera.rightCamera._scene = this.utilityLayerScene;
            }
            this.utilityLayerScene.render(false);
            // Reset camera's scene back to original
            camera._scene = oldScene;
            if (camera.leftCamera) {
                camera.leftCamera._scene = oldScene;
            }
            if (camera.rightCamera) {
                camera.rightCamera._scene = oldScene;
            }
        }
    };
    /**
     * Disposes of the renderer
     */
    UtilityLayerRenderer.prototype.dispose = function () {
        this.onPointerOutObservable.clear();
        if (this._afterRenderObserver) {
            this.originalScene.onAfterRenderObservable.remove(this._afterRenderObserver);
        }
        if (this._sceneDisposeObserver) {
            this.originalScene.onDisposeObservable.remove(this._sceneDisposeObserver);
        }
        if (this._originalPointerObserver) {
            this.originalScene.onPrePointerObservable.remove(this._originalPointerObserver);
        }
        this.utilityLayerScene.dispose();
    };
    UtilityLayerRenderer.prototype._updateCamera = function () {
        if (this.originalScene.activeCameras.length > 1) {
            this.utilityLayerScene.activeCamera = this.originalScene.activeCameras[this.originalScene.activeCameras.length - 1];
        }
        else {
            this.utilityLayerScene.activeCamera = this.originalScene.activeCamera;
        }
    };
    UtilityLayerRenderer._DefaultUtilityLayer = null;
    UtilityLayerRenderer._DefaultKeepDepthUtilityLayer = null;
    return UtilityLayerRenderer;
}());

VertexData.CreateBox = function (options) {
    var nbFaces = 6;
    var indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    var normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0];
    var uvs = [];
    var positions = [];
    var width = options.width || options.size || 1;
    var height = options.height || options.size || 1;
    var depth = options.depth || options.size || 1;
    var wrap = options.wrap || false;
    var topBaseAt = (options.topBaseAt === void 0) ? 1 : options.topBaseAt;
    var bottomBaseAt = (options.bottomBaseAt === void 0) ? 0 : options.bottomBaseAt;
    topBaseAt = (topBaseAt + 4) % 4; // places values as 0 to 3
    bottomBaseAt = (bottomBaseAt + 4) % 4; // places values as 0 to 3
    var topOrder = [2, 0, 3, 1];
    var bottomOrder = [2, 0, 1, 3];
    var topIndex = topOrder[topBaseAt];
    var bottomIndex = bottomOrder[bottomBaseAt];
    var basePositions = [1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, -1, -1, 1];
    if (wrap) {
        indices = [2, 3, 0, 2, 0, 1, 4, 5, 6, 4, 6, 7, 9, 10, 11, 9, 11, 8, 12, 14, 15, 12, 13, 14];
        basePositions = [-1, 1, 1, 1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1];
        var topFaceBase = [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]];
        var bottomFaceBase = [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]];
        var topFaceOrder = [17, 18, 19, 16];
        var bottomFaceOrder = [22, 23, 20, 21];
        while (topIndex > 0) {
            topFaceBase.unshift(topFaceBase.pop());
            topFaceOrder.unshift(topFaceOrder.pop());
            topIndex--;
        }
        while (bottomIndex > 0) {
            bottomFaceBase.unshift(bottomFaceBase.pop());
            bottomFaceOrder.unshift(bottomFaceOrder.pop());
            bottomIndex--;
        }
        topFaceBase = topFaceBase.flat();
        bottomFaceBase = bottomFaceBase.flat();
        basePositions = basePositions.concat(topFaceBase).concat(bottomFaceBase);
        indices.push(topFaceOrder[0], topFaceOrder[2], topFaceOrder[3], topFaceOrder[0], topFaceOrder[1], topFaceOrder[2]);
        indices.push(bottomFaceOrder[0], bottomFaceOrder[2], bottomFaceOrder[3], bottomFaceOrder[0], bottomFaceOrder[1], bottomFaceOrder[2]);
    }
    var scaleArray = [width / 2, height / 2, depth / 2];
    positions = basePositions.reduce(function (accumulator, currentValue, currentIndex) { return accumulator.concat(currentValue * scaleArray[currentIndex % 3]); }, []);
    var sideOrientation = (options.sideOrientation === 0) ? 0 : options.sideOrientation || VertexData.DEFAULTSIDE;
    var faceUV = options.faceUV || new Array(6);
    var faceColors = options.faceColors;
    var colors = [];
    // default face colors and UV if undefined
    for (var f = 0; f < 6; f++) {
        if (faceUV[f] === undefined) {
            faceUV[f] = new Vector4(0, 0, 1, 1);
        }
        if (faceColors && faceColors[f] === undefined) {
            faceColors[f] = new Color4(1, 1, 1, 1);
        }
    }
    // Create each face in turn.
    for (var index = 0; index < nbFaces; index++) {
        uvs.push(faceUV[index].z, faceUV[index].w);
        uvs.push(faceUV[index].x, faceUV[index].w);
        uvs.push(faceUV[index].x, faceUV[index].y);
        uvs.push(faceUV[index].z, faceUV[index].y);
        if (faceColors) {
            for (var c = 0; c < 4; c++) {
                colors.push(faceColors[index].r, faceColors[index].g, faceColors[index].b, faceColors[index].a);
            }
        }
    }
    // sides
    VertexData._ComputeSides(sideOrientation, positions, indices, normals, uvs, options.frontUVs, options.backUVs);
    // Result
    var vertexData = new VertexData();
    vertexData.indices = indices;
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    if (faceColors) {
        var totalColors = (sideOrientation === VertexData.DOUBLESIDE) ? colors.concat(colors) : colors;
        vertexData.colors = totalColors;
    }
    return vertexData;
};
Mesh.CreateBox = function (name, size, scene, updatable, sideOrientation) {
    if (scene === void 0) { scene = null; }
    var options = {
        size: size,
        sideOrientation: sideOrientation,
        updatable: updatable
    };
    return BoxBuilder.CreateBox(name, options, scene);
};
/**
 * Class containing static functions to help procedurally build meshes
 */
var BoxBuilder = /** @class */ (function () {
    function BoxBuilder() {
    }
    /**
     * Creates a box mesh
     * * The parameter `size` sets the size (float) of each box side (default 1)
     * * You can set some different box dimensions by using the parameters `width`, `height` and `depth` (all by default have the same value of `size`)
     * * You can set different colors and different images to each box side by using the parameters `faceColors` (an array of 6 Color3 elements) and `faceUV` (an array of 6 Vector4 elements)
     * * Please read this tutorial : https://doc.babylonjs.com/how_to/createbox_per_face_textures_and_colors
     * * You can also set the mesh side orientation with the values : BABYLON.Mesh.FRONTSIDE (default), BABYLON.Mesh.BACKSIDE or BABYLON.Mesh.DOUBLESIDE
     * * If you create a double-sided mesh, you can choose what parts of the texture image to crop and stick respectively on the front and the back sides with the parameters `frontUVs` and `backUVs` (Vector4). Detail here : https://doc.babylonjs.com/babylon101/discover_basic_elements#side-orientation
     * * The mesh can be set to updatable with the boolean parameter `updatable` (default false) if its internal geometry is supposed to change once created
     * @see https://doc.babylonjs.com/how_to/set_shapes#box
     * @param name defines the name of the mesh
     * @param options defines the options used to create the mesh
     * @param scene defines the hosting scene
     * @returns the box mesh
     */
    BoxBuilder.CreateBox = function (name, options, scene) {
        if (scene === void 0) { scene = null; }
        var box = new Mesh(name, scene);
        options.sideOrientation = Mesh._GetDefaultSideOrientation(options.sideOrientation);
        box._originalBuilderSideOrientation = options.sideOrientation;
        var vertexData = VertexData.CreateBox(options);
        vertexData.applyToMesh(box, options.updatable);
        return box;
    };
    return BoxBuilder;
}());

/**
 * Gather the list of clipboard event types as constants.
 */
var ClipboardEventTypes = /** @class */ (function () {
    function ClipboardEventTypes() {
    }
    /**
     * The clipboard event is fired when a copy command is active (pressed).
     */
    ClipboardEventTypes.COPY = 0x01; //
    /**
     *  The clipboard event is fired when a cut command is active (pressed).
     */
    ClipboardEventTypes.CUT = 0x02;
    /**
     * The clipboard event is fired when a paste command is active (pressed).
     */
    ClipboardEventTypes.PASTE = 0x03;
    return ClipboardEventTypes;
}());
/**
 * This class is used to store clipboard related info for the onClipboardObservable event.
 */
var ClipboardInfo = /** @class */ (function () {
    /**
     *Creates an instance of ClipboardInfo.
     * @param type Defines the type of event (BABYLON.ClipboardEventTypes)
     * @param event Defines the related dom event
     */
    function ClipboardInfo(
    /**
     * Defines the type of event (BABYLON.ClipboardEventTypes)
     */
    type, 
    /**
     * Defines the related dom event
     */
    event) {
        this.type = type;
        this.event = event;
    }
    /**
     *  Get the clipboard event's type from the keycode.
     * @param keyCode Defines the keyCode for the current keyboard event.
     * @return {number}
     */
    ClipboardInfo.GetTypeFromCharacter = function (keyCode) {
        var charCode = keyCode;
        //TODO: add codes for extended ASCII
        switch (charCode) {
            case 67: return ClipboardEventTypes.COPY;
            case 86: return ClipboardEventTypes.PASTE;
            case 88: return ClipboardEventTypes.CUT;
            default: return -1;
        }
    };
    return ClipboardInfo;
}());

/**
 * Defines the layer scene component responsible to manage any layers
 * in a given scene.
 */
var LayerSceneComponent = /** @class */ (function () {
    /**
     * Creates a new instance of the component for the given scene
     * @param scene Defines the scene to register the component in
     */
    function LayerSceneComponent(scene) {
        /**
         * The component name helpfull to identify the component in the list of scene components.
         */
        this.name = SceneComponentConstants.NAME_LAYER;
        this.scene = scene;
        this._engine = scene.getEngine();
        scene.layers = new Array();
    }
    /**
     * Registers the component in a given scene
     */
    LayerSceneComponent.prototype.register = function () {
        this.scene._beforeCameraDrawStage.registerStep(SceneComponentConstants.STEP_BEFORECAMERADRAW_LAYER, this, this._drawCameraBackground);
        this.scene._afterCameraDrawStage.registerStep(SceneComponentConstants.STEP_AFTERCAMERADRAW_LAYER, this, this._drawCameraForeground);
        this.scene._beforeRenderTargetDrawStage.registerStep(SceneComponentConstants.STEP_BEFORERENDERTARGETDRAW_LAYER, this, this._drawRenderTargetBackground);
        this.scene._afterRenderTargetDrawStage.registerStep(SceneComponentConstants.STEP_AFTERRENDERTARGETDRAW_LAYER, this, this._drawRenderTargetForeground);
    };
    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    LayerSceneComponent.prototype.rebuild = function () {
        var layers = this.scene.layers;
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            layer._rebuild();
        }
    };
    /**
     * Disposes the component and the associated ressources.
     */
    LayerSceneComponent.prototype.dispose = function () {
        var layers = this.scene.layers;
        while (layers.length) {
            layers[0].dispose();
        }
    };
    LayerSceneComponent.prototype._draw = function (predicate) {
        var layers = this.scene.layers;
        if (layers.length) {
            this._engine.setDepthBuffer(false);
            for (var _i = 0, layers_2 = layers; _i < layers_2.length; _i++) {
                var layer = layers_2[_i];
                if (predicate(layer)) {
                    layer.render();
                }
            }
            this._engine.setDepthBuffer(true);
        }
    };
    LayerSceneComponent.prototype._drawCameraPredicate = function (layer, isBackground, cameraLayerMask) {
        return !layer.renderOnlyInRenderTargetTextures &&
            layer.isBackground === isBackground &&
            ((layer.layerMask & cameraLayerMask) !== 0);
    };
    LayerSceneComponent.prototype._drawCameraBackground = function (camera) {
        var _this = this;
        this._draw(function (layer) {
            return _this._drawCameraPredicate(layer, true, camera.layerMask);
        });
    };
    LayerSceneComponent.prototype._drawCameraForeground = function (camera) {
        var _this = this;
        this._draw(function (layer) {
            return _this._drawCameraPredicate(layer, false, camera.layerMask);
        });
    };
    LayerSceneComponent.prototype._drawRenderTargetPredicate = function (layer, isBackground, cameraLayerMask, renderTargetTexture) {
        return (layer.renderTargetTextures.length > 0) &&
            layer.isBackground === isBackground &&
            (layer.renderTargetTextures.indexOf(renderTargetTexture) > -1) &&
            ((layer.layerMask & cameraLayerMask) !== 0);
    };
    LayerSceneComponent.prototype._drawRenderTargetBackground = function (renderTarget) {
        var _this = this;
        this._draw(function (layer) {
            return _this._drawRenderTargetPredicate(layer, true, _this.scene.activeCamera.layerMask, renderTarget);
        });
    };
    LayerSceneComponent.prototype._drawRenderTargetForeground = function (renderTarget) {
        var _this = this;
        this._draw(function (layer) {
            return _this._drawRenderTargetPredicate(layer, false, _this.scene.activeCamera.layerMask, renderTarget);
        });
    };
    return LayerSceneComponent;
}());

var name = 'layerPixelShader';
var shader = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\n\nuniform vec4 color;\nvoid main(void) {\nvec4 baseColor=texture2D(textureSampler,vUV);\n#ifdef ALPHATEST\nif (baseColor.a<0.4)\ndiscard;\n#endif\ngl_FragColor=baseColor*color;\n}";
Effect.ShadersStore[name] = shader;

var name$1 = 'layerVertexShader';
var shader$1 = "\nattribute vec2 position;\n\nuniform vec2 scale;\nuniform vec2 offset;\nuniform mat4 textureMatrix;\n\nvarying vec2 vUV;\nconst vec2 madd=vec2(0.5,0.5);\nvoid main(void) {\nvec2 shiftedPosition=position*scale+offset;\nvUV=vec2(textureMatrix*vec4(shiftedPosition*madd+madd,1.0,0.0));\ngl_Position=vec4(shiftedPosition,0.0,1.0);\n}";
Effect.ShadersStore[name$1] = shader$1;

/**
 * This represents a full screen 2d layer.
 * This can be useful to display a picture in the  background of your scene for instance.
 * @see https://www.babylonjs-playground.com/#08A2BS#1
 */
var Layer = /** @class */ (function () {
    /**
     * Instantiates a new layer.
     * This represents a full screen 2d layer.
     * This can be useful to display a picture in the  background of your scene for instance.
     * @see https://www.babylonjs-playground.com/#08A2BS#1
     * @param name Define the name of the layer in the scene
     * @param imgUrl Define the url of the texture to display in the layer
     * @param scene Define the scene the layer belongs to
     * @param isBackground Defines whether the layer is displayed in front or behind the scene
     * @param color Defines a color for the layer
     */
    function Layer(
    /**
     * Define the name of the layer.
     */
    name, imgUrl, scene, isBackground, color) {
        this.name = name;
        /**
         * Define the scale of the layer in order to zoom in out of the texture.
         */
        this.scale = new Vector2(1, 1);
        /**
         * Define an offset for the layer in order to shift the texture.
         */
        this.offset = new Vector2(0, 0);
        /**
         * Define the alpha blending mode used in the layer in case the texture or color has an alpha.
         */
        this.alphaBlendingMode = Constants.ALPHA_COMBINE;
        /**
         * Define a mask to restrict the layer to only some of the scene cameras.
         */
        this.layerMask = 0x0FFFFFFF;
        /**
         * Define the list of render target the layer is visible into.
         */
        this.renderTargetTextures = [];
        /**
         * Define if the layer is only used in renderTarget or if it also
         * renders in the main frame buffer of the canvas.
         */
        this.renderOnlyInRenderTargetTextures = false;
        this._vertexBuffers = {};
        /**
         * An event triggered when the layer is disposed.
         */
        this.onDisposeObservable = new Observable();
        /**
        * An event triggered before rendering the scene
        */
        this.onBeforeRenderObservable = new Observable();
        /**
        * An event triggered after rendering the scene
        */
        this.onAfterRenderObservable = new Observable();
        this.texture = imgUrl ? new Texture(imgUrl, scene, true) : null;
        this.isBackground = isBackground === undefined ? true : isBackground;
        this.color = color === undefined ? new Color4(1, 1, 1, 1) : color;
        this._scene = (scene || EngineStore.LastCreatedScene);
        var layerComponent = this._scene._getComponent(SceneComponentConstants.NAME_LAYER);
        if (!layerComponent) {
            layerComponent = new LayerSceneComponent(this._scene);
            this._scene._addComponent(layerComponent);
        }
        this._scene.layers.push(this);
        var engine = this._scene.getEngine();
        // VBO
        var vertices = [];
        vertices.push(1, 1);
        vertices.push(-1, 1);
        vertices.push(-1, -1);
        vertices.push(1, -1);
        var vertexBuffer = new VertexBuffer(engine, vertices, VertexBuffer.PositionKind, false, false, 2);
        this._vertexBuffers[VertexBuffer.PositionKind] = vertexBuffer;
        this._createIndexBuffer();
        // Effects
        this._effect = engine.createEffect("layer", [VertexBuffer.PositionKind], ["textureMatrix", "color", "scale", "offset"], ["textureSampler"], "");
        this._alphaTestEffect = engine.createEffect("layer", [VertexBuffer.PositionKind], ["textureMatrix", "color", "scale", "offset"], ["textureSampler"], "#define ALPHATEST");
    }
    Object.defineProperty(Layer.prototype, "onDispose", {
        /**
         * Back compatibility with callback before the onDisposeObservable existed.
         * The set callback will be triggered when the layer has been disposed.
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layer.prototype, "onBeforeRender", {
        /**
         * Back compatibility with callback before the onBeforeRenderObservable existed.
         * The set callback will be triggered just before rendering the layer.
         */
        set: function (callback) {
            if (this._onBeforeRenderObserver) {
                this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
            }
            this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Layer.prototype, "onAfterRender", {
        /**
         * Back compatibility with callback before the onAfterRenderObservable existed.
         * The set callback will be triggered just after rendering the layer.
         */
        set: function (callback) {
            if (this._onAfterRenderObserver) {
                this.onAfterRenderObservable.remove(this._onAfterRenderObserver);
            }
            this._onAfterRenderObserver = this.onAfterRenderObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Layer.prototype._createIndexBuffer = function () {
        var engine = this._scene.getEngine();
        // Indices
        var indices = [];
        indices.push(0);
        indices.push(1);
        indices.push(2);
        indices.push(0);
        indices.push(2);
        indices.push(3);
        this._indexBuffer = engine.createIndexBuffer(indices);
    };
    /** @hidden */
    Layer.prototype._rebuild = function () {
        var vb = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vb) {
            vb._rebuild();
        }
        this._createIndexBuffer();
    };
    /**
     * Renders the layer in the scene.
     */
    Layer.prototype.render = function () {
        var currentEffect = this.alphaTest ? this._alphaTestEffect : this._effect;
        // Check
        if (!currentEffect.isReady() || !this.texture || !this.texture.isReady()) {
            return;
        }
        var engine = this._scene.getEngine();
        this.onBeforeRenderObservable.notifyObservers(this);
        // Render
        engine.enableEffect(currentEffect);
        engine.setState(false);
        // Texture
        currentEffect.setTexture("textureSampler", this.texture);
        currentEffect.setMatrix("textureMatrix", this.texture.getTextureMatrix());
        // Color
        currentEffect.setFloat4("color", this.color.r, this.color.g, this.color.b, this.color.a);
        // Scale / offset
        currentEffect.setVector2("offset", this.offset);
        currentEffect.setVector2("scale", this.scale);
        // VBOs
        engine.bindBuffers(this._vertexBuffers, this._indexBuffer, currentEffect);
        // Draw order
        if (!this.alphaTest) {
            engine.setAlphaMode(this.alphaBlendingMode);
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
            engine.setAlphaMode(Constants.ALPHA_DISABLE);
        }
        else {
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        this.onAfterRenderObservable.notifyObservers(this);
    };
    /**
     * Disposes and releases the associated ressources.
     */
    Layer.prototype.dispose = function () {
        var vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        if (this._indexBuffer) {
            this._scene.getEngine()._releaseBuffer(this._indexBuffer);
            this._indexBuffer = null;
        }
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }
        // Clean RTT list
        this.renderTargetTextures = [];
        // Remove from scene
        var index = this._scene.layers.indexOf(this);
        this._scene.layers.splice(index, 1);
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onBeforeRenderObservable.clear();
    };
    return Layer;
}());

/**
 * Vector2 wth index property
 */
var IndexedVector2 = /** @class */ (function (_super) {
    __extends(IndexedVector2, _super);
    function IndexedVector2(original, 
    /** Index of the vector2 */
    index) {
        var _this = _super.call(this, original.x, original.y) || this;
        _this.index = index;
        return _this;
    }
    return IndexedVector2;
}(Vector2));
/**
 * Defines points to create a polygon
 */
var PolygonPoints = /** @class */ (function () {
    function PolygonPoints() {
        this.elements = new Array();
    }
    PolygonPoints.prototype.add = function (originalPoints) {
        var _this = this;
        var result = new Array();
        originalPoints.forEach(function (point) {
            if (result.length === 0 || !point.equalsWithEpsilon(result[0])) {
                var newPoint = new IndexedVector2(point, _this.elements.length);
                result.push(newPoint);
                _this.elements.push(newPoint);
            }
        });
        return result;
    };
    PolygonPoints.prototype.computeBounds = function () {
        var lmin = new Vector2(this.elements[0].x, this.elements[0].y);
        var lmax = new Vector2(this.elements[0].x, this.elements[0].y);
        this.elements.forEach(function (point) {
            // x
            if (point.x < lmin.x) {
                lmin.x = point.x;
            }
            else if (point.x > lmax.x) {
                lmax.x = point.x;
            }
            // y
            if (point.y < lmin.y) {
                lmin.y = point.y;
            }
            else if (point.y > lmax.y) {
                lmax.y = point.y;
            }
        });
        return {
            min: lmin,
            max: lmax,
            width: lmax.x - lmin.x,
            height: lmax.y - lmin.y
        };
    };
    return PolygonPoints;
}());
/**
 * Polygon
 * @see https://doc.babylonjs.com/how_to/parametric_shapes#non-regular-polygon
 */
var Polygon = /** @class */ (function () {
    function Polygon() {
    }
    /**
     * Creates a rectangle
     * @param xmin bottom X coord
     * @param ymin bottom Y coord
     * @param xmax top X coord
     * @param ymax top Y coord
     * @returns points that make the resulting rectation
     */
    Polygon.Rectangle = function (xmin, ymin, xmax, ymax) {
        return [
            new Vector2(xmin, ymin),
            new Vector2(xmax, ymin),
            new Vector2(xmax, ymax),
            new Vector2(xmin, ymax)
        ];
    };
    /**
     * Creates a circle
     * @param radius radius of circle
     * @param cx scale in x
     * @param cy scale in y
     * @param numberOfSides number of sides that make up the circle
     * @returns points that make the resulting circle
     */
    Polygon.Circle = function (radius, cx, cy, numberOfSides) {
        if (cx === void 0) { cx = 0; }
        if (cy === void 0) { cy = 0; }
        if (numberOfSides === void 0) { numberOfSides = 32; }
        var result = new Array();
        var angle = 0;
        var increment = (Math.PI * 2) / numberOfSides;
        for (var i = 0; i < numberOfSides; i++) {
            result.push(new Vector2(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
            angle -= increment;
        }
        return result;
    };
    /**
     * Creates a polygon from input string
     * @param input Input polygon data
     * @returns the parsed points
     */
    Polygon.Parse = function (input) {
        var floats = input.split(/[^-+eE\.\d]+/).map(parseFloat).filter(function (val) { return (!isNaN(val)); });
        var i, result = [];
        for (i = 0; i < (floats.length & 0x7FFFFFFE); i += 2) {
            result.push(new Vector2(floats[i], floats[i + 1]));
        }
        return result;
    };
    /**
     * Starts building a polygon from x and y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @returns the started path2
     */
    Polygon.StartingAt = function (x, y) {
        return Path2.StartingAt(x, y);
    };
    return Polygon;
}());
/**
 * Builds a polygon
 * @see https://doc.babylonjs.com/how_to/polygonmeshbuilder
 */
var PolygonMeshBuilder = /** @class */ (function () {
    /**
     * Creates a PolygonMeshBuilder
     * @param name name of the builder
     * @param contours Path of the polygon
     * @param scene scene to add to when creating the mesh
     * @param earcutInjection can be used to inject your own earcut reference
     */
    function PolygonMeshBuilder(name, contours, scene, earcutInjection) {
        if (earcutInjection === void 0) { earcutInjection = earcut; }
        this._points = new PolygonPoints();
        this._outlinepoints = new PolygonPoints();
        this._holes = new Array();
        this._epoints = new Array();
        this._eholes = new Array();
        this.bjsEarcut = earcutInjection;
        this._name = name;
        this._scene = scene || Engine.LastCreatedScene;
        var points;
        if (contours instanceof Path2) {
            points = contours.getPoints();
        }
        else {
            points = contours;
        }
        this._addToepoint(points);
        this._points.add(points);
        this._outlinepoints.add(points);
        if (typeof this.bjsEarcut === 'undefined') {
            Logger.Warn("Earcut was not found, the polygon will not be built.");
        }
    }
    PolygonMeshBuilder.prototype._addToepoint = function (points) {
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            this._epoints.push(p.x, p.y);
        }
    };
    /**
     * Adds a whole within the polygon
     * @param hole Array of points defining the hole
     * @returns this
     */
    PolygonMeshBuilder.prototype.addHole = function (hole) {
        this._points.add(hole);
        var holepoints = new PolygonPoints();
        holepoints.add(hole);
        this._holes.push(holepoints);
        this._eholes.push(this._epoints.length / 2);
        this._addToepoint(hole);
        return this;
    };
    /**
     * Creates the polygon
     * @param updatable If the mesh should be updatable
     * @param depth The depth of the mesh created
     * @returns the created mesh
     */
    PolygonMeshBuilder.prototype.build = function (updatable, depth) {
        if (updatable === void 0) { updatable = false; }
        if (depth === void 0) { depth = 0; }
        var result = new Mesh(this._name, this._scene);
        var vertexData = this.buildVertexData(depth);
        result.setVerticesData(VertexBuffer.PositionKind, vertexData.positions, updatable);
        result.setVerticesData(VertexBuffer.NormalKind, vertexData.normals, updatable);
        result.setVerticesData(VertexBuffer.UVKind, vertexData.uvs, updatable);
        result.setIndices(vertexData.indices);
        return result;
    };
    /**
     * Creates the polygon
     * @param depth The depth of the mesh created
     * @returns the created VertexData
     */
    PolygonMeshBuilder.prototype.buildVertexData = function (depth) {
        var _this = this;
        if (depth === void 0) { depth = 0; }
        var result = new VertexData();
        var normals = new Array();
        var positions = new Array();
        var uvs = new Array();
        var bounds = this._points.computeBounds();
        this._points.elements.forEach(function (p) {
            normals.push(0, 1.0, 0);
            positions.push(p.x, 0, p.y);
            uvs.push((p.x - bounds.min.x) / bounds.width, (p.y - bounds.min.y) / bounds.height);
        });
        var indices = new Array();
        var res = this.bjsEarcut(this._epoints, this._eholes, 2);
        for (var i = 0; i < res.length; i++) {
            indices.push(res[i]);
        }
        if (depth > 0) {
            var positionscount = (positions.length / 3); //get the current pointcount
            this._points.elements.forEach(function (p) {
                normals.push(0, -1.0, 0);
                positions.push(p.x, -depth, p.y);
                uvs.push(1 - (p.x - bounds.min.x) / bounds.width, 1 - (p.y - bounds.min.y) / bounds.height);
            });
            var totalCount = indices.length;
            for (var i = 0; i < totalCount; i += 3) {
                var i0 = indices[i + 0];
                var i1 = indices[i + 1];
                var i2 = indices[i + 2];
                indices.push(i2 + positionscount);
                indices.push(i1 + positionscount);
                indices.push(i0 + positionscount);
            }
            //Add the sides
            this.addSide(positions, normals, uvs, indices, bounds, this._outlinepoints, depth, false);
            this._holes.forEach(function (hole) {
                _this.addSide(positions, normals, uvs, indices, bounds, hole, depth, true);
            });
        }
        result.indices = indices;
        result.positions = positions;
        result.normals = normals;
        result.uvs = uvs;
        return result;
    };
    /**
     * Adds a side to the polygon
     * @param positions points that make the polygon
     * @param normals normals of the polygon
     * @param uvs uvs of the polygon
     * @param indices indices of the polygon
     * @param bounds bounds of the polygon
     * @param points points of the polygon
     * @param depth depth of the polygon
     * @param flip flip of the polygon
     */
    PolygonMeshBuilder.prototype.addSide = function (positions, normals, uvs, indices, bounds, points, depth, flip) {
        var StartIndex = positions.length / 3;
        var ulength = 0;
        for (var i = 0; i < points.elements.length; i++) {
            var p = points.elements[i];
            var p1;
            if ((i + 1) > points.elements.length - 1) {
                p1 = points.elements[0];
            }
            else {
                p1 = points.elements[i + 1];
            }
            positions.push(p.x, 0, p.y);
            positions.push(p.x, -depth, p.y);
            positions.push(p1.x, 0, p1.y);
            positions.push(p1.x, -depth, p1.y);
            var v1 = new Vector3(p.x, 0, p.y);
            var v2 = new Vector3(p1.x, 0, p1.y);
            var v3 = v2.subtract(v1);
            var v4 = new Vector3(0, 1, 0);
            var vn = Vector3.Cross(v3, v4);
            vn = vn.normalize();
            uvs.push(ulength / bounds.width, 0);
            uvs.push(ulength / bounds.width, 1);
            ulength += v3.length();
            uvs.push((ulength / bounds.width), 0);
            uvs.push((ulength / bounds.width), 1);
            if (!flip) {
                normals.push(-vn.x, -vn.y, -vn.z);
                normals.push(-vn.x, -vn.y, -vn.z);
                normals.push(-vn.x, -vn.y, -vn.z);
                normals.push(-vn.x, -vn.y, -vn.z);
                indices.push(StartIndex);
                indices.push(StartIndex + 1);
                indices.push(StartIndex + 2);
                indices.push(StartIndex + 1);
                indices.push(StartIndex + 3);
                indices.push(StartIndex + 2);
            }
            else {
                normals.push(vn.x, vn.y, vn.z);
                normals.push(vn.x, vn.y, vn.z);
                normals.push(vn.x, vn.y, vn.z);
                normals.push(vn.x, vn.y, vn.z);
                indices.push(StartIndex);
                indices.push(StartIndex + 2);
                indices.push(StartIndex + 1);
                indices.push(StartIndex + 1);
                indices.push(StartIndex + 2);
                indices.push(StartIndex + 3);
            }
            StartIndex += 4;
        }
    };
    return PolygonMeshBuilder;
}());

export { BoxBuilder as B, ClipboardEventTypes as C, DynamicTexture as D, FadeInOutBehavior as F, Layer as L, PolygonMeshBuilder as P, UtilityLayerRenderer as U, PlaneBuilder as a, ClipboardInfo as b, LayerSceneComponent as c, Polygon as d };

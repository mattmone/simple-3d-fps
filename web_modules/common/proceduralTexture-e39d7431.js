import { b as __extends, C as Constants, G as PostProcessManager, T as Tools, Z as Texture, O as Observable, V as Vector3, R as RenderingManager, M as Matrix, W as SceneComponentConstants, Y as Effect, g as VertexBuffer, J as Material, a as __decorate, s as serialize } from './texture-1533b140.js';
import './engine.renderTarget-560eb185.js';

/**
 * This Helps creating a texture that will be created from a camera in your scene.
 * It is basically a dynamic texture that could be used to create special effects for instance.
 * Actually, It is the base of lot of effects in the framework like post process, shadows, effect layers and rendering pipelines...
 */
var RenderTargetTexture = /** @class */ (function (_super) {
    __extends(RenderTargetTexture, _super);
    /**
     * Instantiate a render target texture. This is mainly used to render of screen the scene to for instance apply post processse
     * or used a shadow, depth texture...
     * @param name The friendly name of the texture
     * @param size The size of the RTT (number if square, or {width: number, height:number} or {ratio:} to define a ratio from the main scene)
     * @param scene The scene the RTT belongs to. The latest created scene will be used if not precised.
     * @param generateMipMaps True if mip maps need to be generated after render.
     * @param doNotChangeAspectRatio True to not change the aspect ratio of the scene in the RTT
     * @param type The type of the buffer in the RTT (int, half float, float...)
     * @param isCube True if a cube texture needs to be created
     * @param samplingMode The sampling mode to be usedwith the render target (Linear, Nearest...)
     * @param generateDepthBuffer True to generate a depth buffer
     * @param generateStencilBuffer True to generate a stencil buffer
     * @param isMulti True if multiple textures need to be created (Draw Buffers)
     * @param format The internal format of the buffer in the RTT (RED, RG, RGB, RGBA, ALPHA...)
     * @param delayAllocation if the texture allocation should be delayed (default: false)
     */
    function RenderTargetTexture(name, size, scene, generateMipMaps, doNotChangeAspectRatio, type, isCube, samplingMode, generateDepthBuffer, generateStencilBuffer, isMulti, format, delayAllocation) {
        if (doNotChangeAspectRatio === void 0) { doNotChangeAspectRatio = true; }
        if (type === void 0) { type = Constants.TEXTURETYPE_UNSIGNED_INT; }
        if (isCube === void 0) { isCube = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (generateDepthBuffer === void 0) { generateDepthBuffer = true; }
        if (generateStencilBuffer === void 0) { generateStencilBuffer = false; }
        if (isMulti === void 0) { isMulti = false; }
        if (format === void 0) { format = Constants.TEXTUREFORMAT_RGBA; }
        if (delayAllocation === void 0) { delayAllocation = false; }
        var _this = _super.call(this, null, scene, !generateMipMaps) || this;
        _this.isCube = isCube;
        /**
         * Define if particles should be rendered in your texture.
         */
        _this.renderParticles = true;
        /**
         * Define if sprites should be rendered in your texture.
         */
        _this.renderSprites = false;
        /**
         * Override the default coordinates mode to projection for RTT as it is the most common case for rendered textures.
         */
        _this.coordinatesMode = Texture.PROJECTION_MODE;
        /**
         * Define if the camera viewport should be respected while rendering the texture or if the render should be done to the entire texture.
         */
        _this.ignoreCameraViewport = false;
        /**
        * An event triggered when the texture is unbind.
        */
        _this.onBeforeBindObservable = new Observable();
        /**
        * An event triggered when the texture is unbind.
        */
        _this.onAfterUnbindObservable = new Observable();
        /**
        * An event triggered before rendering the texture
        */
        _this.onBeforeRenderObservable = new Observable();
        /**
        * An event triggered after rendering the texture
        */
        _this.onAfterRenderObservable = new Observable();
        /**
        * An event triggered after the texture clear
        */
        _this.onClearObservable = new Observable();
        _this._currentRefreshId = -1;
        _this._refreshRate = 1;
        _this._samples = 1;
        /**
         * Gets or sets the center of the bounding box associated with the texture (when in cube mode)
         * It must define where the camera used to render the texture is set
         */
        _this.boundingBoxPosition = Vector3.Zero();
        scene = _this.getScene();
        if (!scene) {
            return _this;
        }
        _this.renderList = new Array();
        _this._engine = scene.getEngine();
        _this.name = name;
        _this.isRenderTarget = true;
        _this._initialSizeParameter = size;
        _this._processSizeParameter(size);
        _this._resizeObserver = _this.getScene().getEngine().onResizeObservable.add(function () {
        });
        _this._generateMipMaps = generateMipMaps ? true : false;
        _this._doNotChangeAspectRatio = doNotChangeAspectRatio;
        // Rendering groups
        _this._renderingManager = new RenderingManager(scene);
        _this._renderingManager._useSceneAutoClearSetup = true;
        if (isMulti) {
            return _this;
        }
        _this._renderTargetOptions = {
            generateMipMaps: generateMipMaps,
            type: type,
            format: format,
            samplingMode: samplingMode,
            generateDepthBuffer: generateDepthBuffer,
            generateStencilBuffer: generateStencilBuffer
        };
        if (samplingMode === Texture.NEAREST_SAMPLINGMODE) {
            _this.wrapU = Texture.CLAMP_ADDRESSMODE;
            _this.wrapV = Texture.CLAMP_ADDRESSMODE;
        }
        if (!delayAllocation) {
            if (isCube) {
                _this._texture = scene.getEngine().createRenderTargetCubeTexture(_this.getRenderSize(), _this._renderTargetOptions);
                _this.coordinatesMode = Texture.INVCUBIC_MODE;
                _this._textureMatrix = Matrix.Identity();
            }
            else {
                _this._texture = scene.getEngine().createRenderTargetTexture(_this._size, _this._renderTargetOptions);
            }
        }
        return _this;
    }
    Object.defineProperty(RenderTargetTexture.prototype, "renderList", {
        /**
        * Use this list to define the list of mesh you want to render.
        */
        get: function () {
            return this._renderList;
        },
        set: function (value) {
            this._renderList = value;
            if (this._renderList) {
                this._hookArray(this._renderList);
            }
        },
        enumerable: true,
        configurable: true
    });
    RenderTargetTexture.prototype._hookArray = function (array) {
        var _this = this;
        var oldPush = array.push;
        array.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var wasEmpty = array.length === 0;
            var result = oldPush.apply(array, items);
            if (wasEmpty) {
                _this.getScene().meshes.forEach(function (mesh) {
                    mesh._markSubMeshesAsLightDirty();
                });
            }
            return result;
        };
        var oldSplice = array.splice;
        array.splice = function (index, deleteCount) {
            var deleted = oldSplice.apply(array, [index, deleteCount]);
            if (array.length === 0) {
                _this.getScene().meshes.forEach(function (mesh) {
                    mesh._markSubMeshesAsLightDirty();
                });
            }
            return deleted;
        };
    };
    Object.defineProperty(RenderTargetTexture.prototype, "onAfterUnbind", {
        /**
         * Set a after unbind callback in the texture.
         * This has been kept for backward compatibility and use of onAfterUnbindObservable is recommended.
         */
        set: function (callback) {
            if (this._onAfterUnbindObserver) {
                this.onAfterUnbindObservable.remove(this._onAfterUnbindObserver);
            }
            this._onAfterUnbindObserver = this.onAfterUnbindObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "onBeforeRender", {
        /**
         * Set a before render callback in the texture.
         * This has been kept for backward compatibility and use of onBeforeRenderObservable is recommended.
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
    Object.defineProperty(RenderTargetTexture.prototype, "onAfterRender", {
        /**
         * Set a after render callback in the texture.
         * This has been kept for backward compatibility and use of onAfterRenderObservable is recommended.
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
    Object.defineProperty(RenderTargetTexture.prototype, "onClear", {
        /**
         * Set a clear callback in the texture.
         * This has been kept for backward compatibility and use of onClearObservable is recommended.
         */
        set: function (callback) {
            if (this._onClearObserver) {
                this.onClearObservable.remove(this._onClearObserver);
            }
            this._onClearObserver = this.onClearObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTargetTexture.prototype, "renderTargetOptions", {
        /**
         * Gets render target creation options that were used.
         */
        get: function () {
            return this._renderTargetOptions;
        },
        enumerable: true,
        configurable: true
    });
    RenderTargetTexture.prototype._onRatioRescale = function () {
        if (this._sizeRatio) {
            this.resize(this._initialSizeParameter);
        }
    };
    Object.defineProperty(RenderTargetTexture.prototype, "boundingBoxSize", {
        get: function () {
            return this._boundingBoxSize;
        },
        /**
         * Gets or sets the size of the bounding box associated with the texture (when in cube mode)
         * When defined, the cubemap will switch to local mode
         * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
         * @example https://www.babylonjs-playground.com/#RNASML
         */
        set: function (value) {
            if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
                return;
            }
            this._boundingBoxSize = value;
            var scene = this.getScene();
            if (scene) {
                scene.markAllMaterialsAsDirty(Constants.MATERIAL_TextureDirtyFlag);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a depth stencil texture.
     * This is only available in WebGL 2 or with the depth texture extension available.
     * @param comparisonFunction Specifies the comparison function to set on the texture. If 0 or undefined, the texture is not in comparison mode
     * @param bilinearFiltering Specifies whether or not bilinear filtering is enable on the texture
     * @param generateStencil Specifies whether or not a stencil should be allocated in the texture
     */
    RenderTargetTexture.prototype.createDepthStencilTexture = function (comparisonFunction, bilinearFiltering, generateStencil) {
        if (comparisonFunction === void 0) { comparisonFunction = 0; }
        if (bilinearFiltering === void 0) { bilinearFiltering = true; }
        if (generateStencil === void 0) { generateStencil = false; }
        if (!this.getScene()) {
            return;
        }
        var engine = this.getScene().getEngine();
        this.depthStencilTexture = engine.createDepthStencilTexture(this._size, {
            bilinearFiltering: bilinearFiltering,
            comparisonFunction: comparisonFunction,
            generateStencil: generateStencil,
            isCube: this.isCube
        });
        engine.setFrameBufferDepthStencilTexture(this);
    };
    RenderTargetTexture.prototype._processSizeParameter = function (size) {
        if (size.ratio) {
            this._sizeRatio = size.ratio;
            this._size = {
                width: this._bestReflectionRenderTargetDimension(this._engine.getRenderWidth(), this._sizeRatio),
                height: this._bestReflectionRenderTargetDimension(this._engine.getRenderHeight(), this._sizeRatio)
            };
        }
        else {
            this._size = size;
        }
    };
    Object.defineProperty(RenderTargetTexture.prototype, "samples", {
        /**
         * Define the number of samples to use in case of MSAA.
         * It defaults to one meaning no MSAA has been enabled.
         */
        get: function () {
            return this._samples;
        },
        set: function (value) {
            if (this._samples === value) {
                return;
            }
            var scene = this.getScene();
            if (!scene) {
                return;
            }
            this._samples = scene.getEngine().updateRenderTargetTextureSampleCount(this._texture, value);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the refresh counter of the texture and start bak from scratch.
     * Could be useful to regenerate the texture if it is setup to render only once.
     */
    RenderTargetTexture.prototype.resetRefreshCounter = function () {
        this._currentRefreshId = -1;
    };
    Object.defineProperty(RenderTargetTexture.prototype, "refreshRate", {
        /**
         * Define the refresh rate of the texture or the rendering frequency.
         * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
         */
        get: function () {
            return this._refreshRate;
        },
        set: function (value) {
            this._refreshRate = value;
            this.resetRefreshCounter();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a post process to the render target rendering passes.
     * @param postProcess define the post process to add
     */
    RenderTargetTexture.prototype.addPostProcess = function (postProcess) {
        if (!this._postProcessManager) {
            var scene = this.getScene();
            if (!scene) {
                return;
            }
            this._postProcessManager = new PostProcessManager(scene);
            this._postProcesses = new Array();
        }
        this._postProcesses.push(postProcess);
        this._postProcesses[0].autoClear = false;
    };
    /**
     * Clear all the post processes attached to the render target
     * @param dispose define if the cleared post processesshould also be disposed (false by default)
     */
    RenderTargetTexture.prototype.clearPostProcesses = function (dispose) {
        if (dispose === void 0) { dispose = false; }
        if (!this._postProcesses) {
            return;
        }
        if (dispose) {
            for (var _i = 0, _a = this._postProcesses; _i < _a.length; _i++) {
                var postProcess = _a[_i];
                postProcess.dispose();
            }
        }
        this._postProcesses = [];
    };
    /**
     * Remove one of the post process from the list of attached post processes to the texture
     * @param postProcess define the post process to remove from the list
     */
    RenderTargetTexture.prototype.removePostProcess = function (postProcess) {
        if (!this._postProcesses) {
            return;
        }
        var index = this._postProcesses.indexOf(postProcess);
        if (index === -1) {
            return;
        }
        this._postProcesses.splice(index, 1);
        if (this._postProcesses.length > 0) {
            this._postProcesses[0].autoClear = false;
        }
    };
    /** @hidden */
    RenderTargetTexture.prototype._shouldRender = function () {
        if (this._currentRefreshId === -1) { // At least render once
            this._currentRefreshId = 1;
            return true;
        }
        if (this.refreshRate === this._currentRefreshId) {
            this._currentRefreshId = 1;
            return true;
        }
        this._currentRefreshId++;
        return false;
    };
    /**
     * Gets the actual render size of the texture.
     * @returns the width of the render size
     */
    RenderTargetTexture.prototype.getRenderSize = function () {
        return this.getRenderWidth();
    };
    /**
     * Gets the actual render width of the texture.
     * @returns the width of the render size
     */
    RenderTargetTexture.prototype.getRenderWidth = function () {
        if (this._size.width) {
            return this._size.width;
        }
        return this._size;
    };
    /**
     * Gets the actual render height of the texture.
     * @returns the height of the render size
     */
    RenderTargetTexture.prototype.getRenderHeight = function () {
        if (this._size.width) {
            return this._size.height;
        }
        return this._size;
    };
    Object.defineProperty(RenderTargetTexture.prototype, "canRescale", {
        /**
         * Get if the texture can be rescaled or not.
         */
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resize the texture using a ratio.
     * @param ratio the ratio to apply to the texture size in order to compute the new target size
     */
    RenderTargetTexture.prototype.scale = function (ratio) {
        var newSize = this.getRenderSize() * ratio;
        this.resize(newSize);
    };
    /**
     * Get the texture reflection matrix used to rotate/transform the reflection.
     * @returns the reflection matrix
     */
    RenderTargetTexture.prototype.getReflectionTextureMatrix = function () {
        if (this.isCube) {
            return this._textureMatrix;
        }
        return _super.prototype.getReflectionTextureMatrix.call(this);
    };
    /**
     * Resize the texture to a new desired size.
     * Be carrefull as it will recreate all the data in the new texture.
     * @param size Define the new size. It can be:
     *   - a number for squared texture,
     *   - an object containing { width: number, height: number }
     *   - or an object containing a ratio { ratio: number }
     */
    RenderTargetTexture.prototype.resize = function (size) {
        var wasCube = this.isCube;
        this.releaseInternalTexture();
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this._processSizeParameter(size);
        if (wasCube) {
            this._texture = scene.getEngine().createRenderTargetCubeTexture(this.getRenderSize(), this._renderTargetOptions);
        }
        else {
            this._texture = scene.getEngine().createRenderTargetTexture(this._size, this._renderTargetOptions);
        }
    };
    /**
     * Renders all the objects from the render list into the texture.
     * @param useCameraPostProcess Define if camera post processes should be used during the rendering
     * @param dumpForDebug Define if the rendering result should be dumped (copied) for debugging purpose
     */
    RenderTargetTexture.prototype.render = function (useCameraPostProcess, dumpForDebug) {
        if (useCameraPostProcess === void 0) { useCameraPostProcess = false; }
        if (dumpForDebug === void 0) { dumpForDebug = false; }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = scene.getEngine();
        if (this.useCameraPostProcesses !== undefined) {
            useCameraPostProcess = this.useCameraPostProcesses;
        }
        if (this._waitingRenderList) {
            this.renderList = [];
            for (var index = 0; index < this._waitingRenderList.length; index++) {
                var id = this._waitingRenderList[index];
                var mesh_1 = scene.getMeshByID(id);
                if (mesh_1) {
                    this.renderList.push(mesh_1);
                }
            }
            delete this._waitingRenderList;
        }
        // Is predicate defined?
        if (this.renderListPredicate) {
            if (this.renderList) {
                this.renderList.length = 0; // Clear previous renderList
            }
            else {
                this.renderList = [];
            }
            var scene = this.getScene();
            if (!scene) {
                return;
            }
            var sceneMeshes = scene.meshes;
            for (var index = 0; index < sceneMeshes.length; index++) {
                var mesh = sceneMeshes[index];
                if (this.renderListPredicate(mesh)) {
                    this.renderList.push(mesh);
                }
            }
        }
        this.onBeforeBindObservable.notifyObservers(this);
        // Set custom projection.
        // Needs to be before binding to prevent changing the aspect ratio.
        var camera;
        if (this.activeCamera) {
            camera = this.activeCamera;
            engine.setViewport(this.activeCamera.viewport, this.getRenderWidth(), this.getRenderHeight());
            if (this.activeCamera !== scene.activeCamera) {
                scene.setTransformMatrix(this.activeCamera.getViewMatrix(), this.activeCamera.getProjectionMatrix(true));
            }
        }
        else {
            camera = scene.activeCamera;
            if (camera) {
                engine.setViewport(camera.viewport, this.getRenderWidth(), this.getRenderHeight());
            }
        }
        // Prepare renderingManager
        this._renderingManager.reset();
        var currentRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
        var currentRenderListLength = this.renderList ? this.renderList.length : scene.getActiveMeshes().length;
        var sceneRenderId = scene.getRenderId();
        for (var meshIndex = 0; meshIndex < currentRenderListLength; meshIndex++) {
            var mesh = currentRenderList[meshIndex];
            if (mesh) {
                if (!mesh.isReady(this.refreshRate === 0)) {
                    this.resetRefreshCounter();
                    continue;
                }
                mesh._preActivateForIntermediateRendering(sceneRenderId);
                var isMasked = void 0;
                if (!this.renderList && camera) {
                    isMasked = ((mesh.layerMask & camera.layerMask) === 0);
                }
                else {
                    isMasked = false;
                }
                if (mesh.isEnabled() && mesh.isVisible && mesh.subMeshes && !isMasked) {
                    if (mesh._activate(sceneRenderId, true)) {
                        if (!mesh.isAnInstance) {
                            mesh._internalAbstractMeshDataInfo._onlyForInstancesIntermediate = false;
                        }
                        else {
                            mesh = mesh.sourceMesh;
                        }
                        mesh._internalAbstractMeshDataInfo._isActiveIntermediate = true;
                        for (var subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                            var subMesh = mesh.subMeshes[subIndex];
                            scene._activeIndices.addCount(subMesh.indexCount, false);
                            this._renderingManager.dispatch(subMesh, mesh);
                        }
                    }
                }
            }
        }
        for (var particleIndex = 0; particleIndex < scene.particleSystems.length; particleIndex++) {
            var particleSystem = scene.particleSystems[particleIndex];
            var emitter = particleSystem.emitter;
            if (!particleSystem.isStarted() || !emitter || !emitter.position || !emitter.isEnabled()) {
                continue;
            }
            if (currentRenderList.indexOf(emitter) >= 0) {
                this._renderingManager.dispatchParticles(particleSystem);
            }
        }
        if (this.isCube) {
            for (var face = 0; face < 6; face++) {
                this.renderToTarget(face, currentRenderList, useCameraPostProcess, dumpForDebug);
                scene.incrementRenderId();
                scene.resetCachedMaterial();
            }
        }
        else {
            this.renderToTarget(0, currentRenderList, useCameraPostProcess, dumpForDebug);
        }
        this.onAfterUnbindObservable.notifyObservers(this);
        if (scene.activeCamera) {
            if (this.activeCamera && this.activeCamera !== scene.activeCamera) {
                scene.setTransformMatrix(scene.activeCamera.getViewMatrix(), scene.activeCamera.getProjectionMatrix(true));
            }
            engine.setViewport(scene.activeCamera.viewport);
        }
        scene.resetCachedMaterial();
    };
    RenderTargetTexture.prototype._bestReflectionRenderTargetDimension = function (renderDimension, scale) {
        var minimum = 128;
        var x = renderDimension * scale;
        var curved = Tools.NearestPOT(x + (minimum * minimum / (minimum + x)));
        // Ensure we don't exceed the render dimension (while staying POT)
        return Math.min(Tools.FloorPOT(renderDimension), curved);
    };
    /**
     * @hidden
     * @param faceIndex face index to bind to if this is a cubetexture
     */
    RenderTargetTexture.prototype._bindFrameBuffer = function (faceIndex) {
        if (faceIndex === void 0) { faceIndex = 0; }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = scene.getEngine();
        if (this._texture) {
            engine.bindFramebuffer(this._texture, this.isCube ? faceIndex : undefined, undefined, undefined, this.ignoreCameraViewport, this.depthStencilTexture ? this.depthStencilTexture : undefined);
        }
    };
    RenderTargetTexture.prototype.unbindFrameBuffer = function (engine, faceIndex) {
        var _this = this;
        if (!this._texture) {
            return;
        }
        engine.unBindFramebuffer(this._texture, this.isCube, function () {
            _this.onAfterRenderObservable.notifyObservers(faceIndex);
        });
    };
    RenderTargetTexture.prototype.renderToTarget = function (faceIndex, currentRenderList, useCameraPostProcess, dumpForDebug) {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = scene.getEngine();
        if (!this._texture) {
            return;
        }
        // Bind
        if (this._postProcessManager) {
            this._postProcessManager._prepareFrame(this._texture, this._postProcesses);
        }
        else if (!useCameraPostProcess || !scene.postProcessManager._prepareFrame(this._texture)) {
            this._bindFrameBuffer(faceIndex);
        }
        this.onBeforeRenderObservable.notifyObservers(faceIndex);
        // Clear
        if (this.onClearObservable.hasObservers()) {
            this.onClearObservable.notifyObservers(engine);
        }
        else {
            engine.clear(this.clearColor || scene.clearColor, true, true, true);
        }
        if (!this._doNotChangeAspectRatio) {
            scene.updateTransformMatrix(true);
        }
        // Before Camera Draw
        for (var _i = 0, _a = scene._beforeRenderTargetDrawStage; _i < _a.length; _i++) {
            var step = _a[_i];
            step.action(this);
        }
        // Render
        this._renderingManager.render(this.customRenderFunction, currentRenderList, this.renderParticles, this.renderSprites);
        // After Camera Draw
        for (var _b = 0, _c = scene._afterRenderTargetDrawStage; _b < _c.length; _b++) {
            var step = _c[_b];
            step.action(this);
        }
        if (this._postProcessManager) {
            this._postProcessManager._finalizeFrame(false, this._texture, faceIndex, this._postProcesses, this.ignoreCameraViewport);
        }
        else if (useCameraPostProcess) {
            scene.postProcessManager._finalizeFrame(false, this._texture, faceIndex);
        }
        if (!this._doNotChangeAspectRatio) {
            scene.updateTransformMatrix(true);
        }
        // Dump ?
        if (dumpForDebug) {
            Tools.DumpFramebuffer(this.getRenderWidth(), this.getRenderHeight(), engine);
        }
        // Unbind
        if (!this.isCube || faceIndex === 5) {
            if (this.isCube) {
                if (faceIndex === 5) {
                    engine.generateMipMapsForCubemap(this._texture);
                }
            }
            this.unbindFrameBuffer(engine, faceIndex);
        }
        else {
            this.onAfterRenderObservable.notifyObservers(faceIndex);
        }
    };
    /**
     * Overrides the default sort function applied in the renderging group to prepare the meshes.
     * This allowed control for front to back rendering or reversly depending of the special needs.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
     * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
     * @param transparentSortCompareFn The transparent queue comparison function use to sort.
     */
    RenderTargetTexture.prototype.setRenderingOrder = function (renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn) {
        if (opaqueSortCompareFn === void 0) { opaqueSortCompareFn = null; }
        if (alphaTestSortCompareFn === void 0) { alphaTestSortCompareFn = null; }
        if (transparentSortCompareFn === void 0) { transparentSortCompareFn = null; }
        this._renderingManager.setRenderingOrder(renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn);
    };
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     */
    RenderTargetTexture.prototype.setRenderingAutoClearDepthStencil = function (renderingGroupId, autoClearDepthStencil) {
        this._renderingManager.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil);
        this._renderingManager._useSceneAutoClearSetup = false;
    };
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    RenderTargetTexture.prototype.clone = function () {
        var textureSize = this.getSize();
        var newTexture = new RenderTargetTexture(this.name, textureSize, this.getScene(), this._renderTargetOptions.generateMipMaps, this._doNotChangeAspectRatio, this._renderTargetOptions.type, this.isCube, this._renderTargetOptions.samplingMode, this._renderTargetOptions.generateDepthBuffer, this._renderTargetOptions.generateStencilBuffer);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        if (this.renderList) {
            newTexture.renderList = this.renderList.slice(0);
        }
        return newTexture;
    };
    /**
     * Serialize the texture to a JSON representation we can easily use in the resepective Parse function.
     * @returns The JSON representation of the texture
     */
    RenderTargetTexture.prototype.serialize = function () {
        if (!this.name) {
            return null;
        }
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.renderTargetSize = this.getRenderSize();
        serializationObject.renderList = [];
        if (this.renderList) {
            for (var index = 0; index < this.renderList.length; index++) {
                serializationObject.renderList.push(this.renderList[index].id);
            }
        }
        return serializationObject;
    };
    /**
     *  This will remove the attached framebuffer objects. The texture will not be able to be used as render target anymore
     */
    RenderTargetTexture.prototype.disposeFramebufferObjects = function () {
        var objBuffer = this.getInternalTexture();
        var scene = this.getScene();
        if (objBuffer && scene) {
            scene.getEngine()._releaseFramebufferObjects(objBuffer);
        }
    };
    /**
     * Dispose the texture and release its associated resources.
     */
    RenderTargetTexture.prototype.dispose = function () {
        if (this._postProcessManager) {
            this._postProcessManager.dispose();
            this._postProcessManager = null;
        }
        this.clearPostProcesses(true);
        if (this._resizeObserver) {
            this.getScene().getEngine().onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        this.renderList = null;
        // Remove from custom render targets
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var index = scene.customRenderTargets.indexOf(this);
        if (index >= 0) {
            scene.customRenderTargets.splice(index, 1);
        }
        for (var _i = 0, _a = scene.cameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            index = camera.customRenderTargets.indexOf(this);
            if (index >= 0) {
                camera.customRenderTargets.splice(index, 1);
            }
        }
        _super.prototype.dispose.call(this);
    };
    /** @hidden */
    RenderTargetTexture.prototype._rebuild = function () {
        if (this.refreshRate === RenderTargetTexture.REFRESHRATE_RENDER_ONCE) {
            this.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        }
        if (this._postProcessManager) {
            this._postProcessManager._rebuild();
        }
    };
    /**
     * Clear the info related to rendering groups preventing retention point in material dispose.
     */
    RenderTargetTexture.prototype.freeRenderingGroups = function () {
        if (this._renderingManager) {
            this._renderingManager.freeRenderingGroups();
        }
    };
    /**
     * Gets the number of views the corresponding to the texture (eg. a MultiviewRenderTarget will have > 1)
     * @returns the view count
     */
    RenderTargetTexture.prototype.getViewCount = function () {
        return 1;
    };
    /**
     * The texture will only be rendered once which can be useful to improve performance if everything in your render is static for instance.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONCE = 0;
    /**
     * The texture will only be rendered rendered every frame and is recomended for dynamic contents.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME = 1;
    /**
     * The texture will be rendered every 2 frames which could be enough if your dynamic objects are not
     * the central point of your effect and can save a lot of performances.
     */
    RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYTWOFRAMES = 2;
    return RenderTargetTexture;
}(Texture));
Texture._CreateRenderTargetTexture = function (name, renderTargetSize, scene, generateMipMaps) {
    return new RenderTargetTexture(name, renderTargetSize, scene, generateMipMaps);
};

/**
 * Defines the Procedural Texture scene component responsible to manage any Procedural Texture
 * in a given scene.
 */
var ProceduralTextureSceneComponent = /** @class */ (function () {
    /**
     * Creates a new instance of the component for the given scene
     * @param scene Defines the scene to register the component in
     */
    function ProceduralTextureSceneComponent(scene) {
        /**
         * The component name helpfull to identify the component in the list of scene components.
         */
        this.name = SceneComponentConstants.NAME_PROCEDURALTEXTURE;
        this.scene = scene;
        this.scene.proceduralTextures = new Array();
        scene.layers = new Array();
    }
    /**
     * Registers the component in a given scene
     */
    ProceduralTextureSceneComponent.prototype.register = function () {
        this.scene._beforeClearStage.registerStep(SceneComponentConstants.STEP_BEFORECLEAR_PROCEDURALTEXTURE, this, this._beforeClear);
    };
    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    ProceduralTextureSceneComponent.prototype.rebuild = function () {
        // Nothing to do here.
    };
    /**
     * Disposes the component and the associated ressources.
     */
    ProceduralTextureSceneComponent.prototype.dispose = function () {
        // Nothing to do here.
    };
    ProceduralTextureSceneComponent.prototype._beforeClear = function () {
        if (this.scene.proceduralTexturesEnabled) {
            Tools.StartPerformanceCounter("Procedural textures", this.scene.proceduralTextures.length > 0);
            for (var proceduralIndex = 0; proceduralIndex < this.scene.proceduralTextures.length; proceduralIndex++) {
                var proceduralTexture = this.scene.proceduralTextures[proceduralIndex];
                if (proceduralTexture._shouldRender()) {
                    proceduralTexture.render();
                }
            }
            Tools.EndPerformanceCounter("Procedural textures", this.scene.proceduralTextures.length > 0);
        }
    };
    return ProceduralTextureSceneComponent;
}());

var name = 'proceduralVertexShader';
var shader = "\nattribute vec2 position;\n\nvarying vec2 vPosition;\nvarying vec2 vUV;\nconst vec2 madd=vec2(0.5,0.5);\nvoid main(void) {\nvPosition=position;\nvUV=position*madd+madd;\ngl_Position=vec4(position,0.0,1.0);\n}";
Effect.ShadersStore[name] = shader;

/**
 * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes calmpler' images.
 * This is the base class of any Procedural texture and contains most of the shareable code.
 * @see http://doc.babylonjs.com/how_to/how_to_use_procedural_textures
 */
var ProceduralTexture = /** @class */ (function (_super) {
    __extends(ProceduralTexture, _super);
    /**
     * Instantiates a new procedural texture.
     * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes called 'refMaps' or 'sampler' images.
     * This is the base class of any Procedural texture and contains most of the shareable code.
     * @see http://doc.babylonjs.com/how_to/how_to_use_procedural_textures
     * @param name  Define the name of the texture
     * @param size Define the size of the texture to create
     * @param fragment Define the fragment shader to use to generate the texture or null if it is defined later
     * @param scene Define the scene the texture belongs to
     * @param fallbackTexture Define a fallback texture in case there were issues to create the custom texture
     * @param generateMipMaps Define if the texture should creates mip maps or not
     * @param isCube Define if the texture is a cube texture or not (this will render each faces of the cube)
     */
    function ProceduralTexture(name, size, fragment, scene, fallbackTexture, generateMipMaps, isCube) {
        if (fallbackTexture === void 0) { fallbackTexture = null; }
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (isCube === void 0) { isCube = false; }
        var _this = _super.call(this, null, scene, !generateMipMaps) || this;
        _this.isCube = isCube;
        /**
         * Define if the texture is enabled or not (disabled texture will not render)
         */
        _this.isEnabled = true;
        /**
         * Define if the texture must be cleared before rendering (default is true)
         */
        _this.autoClear = true;
        /**
         * Event raised when the texture is generated
         */
        _this.onGeneratedObservable = new Observable();
        /** @hidden */
        _this._textures = {};
        _this._currentRefreshId = -1;
        _this._refreshRate = 1;
        _this._vertexBuffers = {};
        _this._uniforms = new Array();
        _this._samplers = new Array();
        _this._floats = {};
        _this._ints = {};
        _this._floatsArrays = {};
        _this._colors3 = {};
        _this._colors4 = {};
        _this._vectors2 = {};
        _this._vectors3 = {};
        _this._matrices = {};
        _this._fallbackTextureUsed = false;
        _this._cachedDefines = "";
        _this._contentUpdateId = -1;
        scene = _this.getScene();
        var component = scene._getComponent(SceneComponentConstants.NAME_PROCEDURALTEXTURE);
        if (!component) {
            component = new ProceduralTextureSceneComponent(scene);
            scene._addComponent(component);
        }
        scene.proceduralTextures.push(_this);
        _this._engine = scene.getEngine();
        _this.name = name;
        _this.isRenderTarget = true;
        _this._size = size;
        _this._generateMipMaps = generateMipMaps;
        _this.setFragment(fragment);
        _this._fallbackTexture = fallbackTexture;
        if (isCube) {
            _this._texture = _this._engine.createRenderTargetCubeTexture(size, { generateMipMaps: generateMipMaps, generateDepthBuffer: false, generateStencilBuffer: false });
            _this.setFloat("face", 0);
        }
        else {
            _this._texture = _this._engine.createRenderTargetTexture(size, { generateMipMaps: generateMipMaps, generateDepthBuffer: false, generateStencilBuffer: false });
        }
        // VBO
        var vertices = [];
        vertices.push(1, 1);
        vertices.push(-1, 1);
        vertices.push(-1, -1);
        vertices.push(1, -1);
        _this._vertexBuffers[VertexBuffer.PositionKind] = new VertexBuffer(_this._engine, vertices, VertexBuffer.PositionKind, false, false, 2);
        _this._createIndexBuffer();
        return _this;
    }
    /**
     * The effect that is created when initializing the post process.
     * @returns The created effect corrisponding the the postprocess.
     */
    ProceduralTexture.prototype.getEffect = function () {
        return this._effect;
    };
    /**
     * Gets texture content (Use this function wisely as reading from a texture can be slow)
     * @returns an ArrayBufferView (Uint8Array or Float32Array)
     */
    ProceduralTexture.prototype.getContent = function () {
        if (this._contentData && this._currentRefreshId == this._contentUpdateId) {
            return this._contentData;
        }
        this._contentData = this.readPixels(0, 0, this._contentData);
        this._contentUpdateId = this._currentRefreshId;
        return this._contentData;
    };
    ProceduralTexture.prototype._createIndexBuffer = function () {
        var engine = this._engine;
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
    ProceduralTexture.prototype._rebuild = function () {
        var vb = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vb) {
            vb._rebuild();
        }
        this._createIndexBuffer();
        if (this.refreshRate === RenderTargetTexture.REFRESHRATE_RENDER_ONCE) {
            this.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        }
    };
    /**
     * Resets the texture in order to recreate its associated resources.
     * This can be called in case of context loss
     */
    ProceduralTexture.prototype.reset = function () {
        if (this._effect === undefined) {
            return;
        }
        this._effect.dispose();
    };
    ProceduralTexture.prototype._getDefines = function () {
        return "";
    };
    /**
     * Is the texture ready to be used ? (rendered at least once)
     * @returns true if ready, otherwise, false.
     */
    ProceduralTexture.prototype.isReady = function () {
        var _this = this;
        var engine = this._engine;
        var shaders;
        if (!this._fragment) {
            return false;
        }
        if (this._fallbackTextureUsed) {
            return true;
        }
        var defines = this._getDefines();
        if (this._effect && defines === this._cachedDefines && this._effect.isReady()) {
            return true;
        }
        if (this._fragment.fragmentElement !== undefined) {
            shaders = { vertex: "procedural", fragmentElement: this._fragment.fragmentElement };
        }
        else {
            shaders = { vertex: "procedural", fragment: this._fragment };
        }
        this._cachedDefines = defines;
        this._effect = engine.createEffect(shaders, [VertexBuffer.PositionKind], this._uniforms, this._samplers, defines, undefined, undefined, function () {
            _this.releaseInternalTexture();
            if (_this._fallbackTexture) {
                _this._texture = _this._fallbackTexture._texture;
                if (_this._texture) {
                    _this._texture.incrementReferences();
                }
            }
            _this._fallbackTextureUsed = true;
        });
        return this._effect.isReady();
    };
    /**
     * Resets the refresh counter of the texture and start bak from scratch.
     * Could be useful to regenerate the texture if it is setup to render only once.
     */
    ProceduralTexture.prototype.resetRefreshCounter = function () {
        this._currentRefreshId = -1;
    };
    /**
     * Set the fragment shader to use in order to render the texture.
     * @param fragment This can be set to a path (into the shader store) or to a json object containing a fragmentElement property.
     */
    ProceduralTexture.prototype.setFragment = function (fragment) {
        this._fragment = fragment;
    };
    Object.defineProperty(ProceduralTexture.prototype, "refreshRate", {
        /**
         * Define the refresh rate of the texture or the rendering frequency.
         * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
         */
        get: function () {
            return this._refreshRate;
        },
        set: function (value) {
            this._refreshRate = value;
            this.resetRefreshCounter();
        },
        enumerable: true,
        configurable: true
    });
    /** @hidden */
    ProceduralTexture.prototype._shouldRender = function () {
        if (!this.isEnabled || !this.isReady() || !this._texture) {
            if (this._texture) {
                this._texture.isReady = false;
            }
            return false;
        }
        if (this._fallbackTextureUsed) {
            return false;
        }
        if (this._currentRefreshId === -1) { // At least render once
            this._currentRefreshId = 1;
            return true;
        }
        if (this.refreshRate === this._currentRefreshId) {
            this._currentRefreshId = 1;
            return true;
        }
        this._currentRefreshId++;
        return false;
    };
    /**
     * Get the size the texture is rendering at.
     * @returns the size (texture is always squared)
     */
    ProceduralTexture.prototype.getRenderSize = function () {
        return this._size;
    };
    /**
     * Resize the texture to new value.
     * @param size Define the new size the texture should have
     * @param generateMipMaps Define whether the new texture should create mip maps
     */
    ProceduralTexture.prototype.resize = function (size, generateMipMaps) {
        if (this._fallbackTextureUsed) {
            return;
        }
        this.releaseInternalTexture();
        this._texture = this._engine.createRenderTargetTexture(size, generateMipMaps);
        // Update properties
        this._size = size;
        this._generateMipMaps = generateMipMaps;
    };
    ProceduralTexture.prototype._checkUniform = function (uniformName) {
        if (this._uniforms.indexOf(uniformName) === -1) {
            this._uniforms.push(uniformName);
        }
    };
    /**
     * Set a texture in the shader program used to render.
     * @param name Define the name of the uniform samplers as defined in the shader
     * @param texture Define the texture to bind to this sampler
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setTexture = function (name, texture) {
        if (this._samplers.indexOf(name) === -1) {
            this._samplers.push(name);
        }
        this._textures[name] = texture;
        return this;
    };
    /**
     * Set a float in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setFloat = function (name, value) {
        this._checkUniform(name);
        this._floats[name] = value;
        return this;
    };
    /**
     * Set a int in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setInt = function (name, value) {
        this._checkUniform(name);
        this._ints[name] = value;
        return this;
    };
    /**
     * Set an array of floats in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setFloats = function (name, value) {
        this._checkUniform(name);
        this._floatsArrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Color3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setColor3 = function (name, value) {
        this._checkUniform(name);
        this._colors3[name] = value;
        return this;
    };
    /**
     * Set a vec4 in the shader from a Color4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setColor4 = function (name, value) {
        this._checkUniform(name);
        this._colors4[name] = value;
        return this;
    };
    /**
     * Set a vec2 in the shader from a Vector2.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setVector2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Vector3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setVector3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3[name] = value;
        return this;
    };
    /**
     * Set a mat4 in the shader from a MAtrix.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the texture itself allowing "fluent" like uniform updates
     */
    ProceduralTexture.prototype.setMatrix = function (name, value) {
        this._checkUniform(name);
        this._matrices[name] = value;
        return this;
    };
    /**
     * Render the texture to its associated render target.
     * @param useCameraPostProcess Define if camera post process should be applied to the texture
     */
    ProceduralTexture.prototype.render = function (useCameraPostProcess) {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var engine = this._engine;
        // Render
        engine.enableEffect(this._effect);
        engine.setState(false);
        // Texture
        for (var name in this._textures) {
            this._effect.setTexture(name, this._textures[name]);
        }
        // Float
        for (name in this._ints) {
            this._effect.setInt(name, this._ints[name]);
        }
        // Float
        for (name in this._floats) {
            this._effect.setFloat(name, this._floats[name]);
        }
        // Floats
        for (name in this._floatsArrays) {
            this._effect.setArray(name, this._floatsArrays[name]);
        }
        // Color3
        for (name in this._colors3) {
            this._effect.setColor3(name, this._colors3[name]);
        }
        // Color4
        for (name in this._colors4) {
            var color = this._colors4[name];
            this._effect.setFloat4(name, color.r, color.g, color.b, color.a);
        }
        // Vector2
        for (name in this._vectors2) {
            this._effect.setVector2(name, this._vectors2[name]);
        }
        // Vector3
        for (name in this._vectors3) {
            this._effect.setVector3(name, this._vectors3[name]);
        }
        // Matrix
        for (name in this._matrices) {
            this._effect.setMatrix(name, this._matrices[name]);
        }
        if (!this._texture) {
            return;
        }
        if (this.isCube) {
            for (var face = 0; face < 6; face++) {
                engine.bindFramebuffer(this._texture, face, undefined, undefined, true);
                // VBOs
                engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._effect);
                this._effect.setFloat("face", face);
                // Clear
                if (this.autoClear) {
                    engine.clear(scene.clearColor, true, false, false);
                }
                // Draw order
                engine.drawElementsType(Material.TriangleFillMode, 0, 6);
                // Mipmaps
                if (face === 5) {
                    engine.generateMipMapsForCubemap(this._texture);
                }
            }
        }
        else {
            engine.bindFramebuffer(this._texture, 0, undefined, undefined, true);
            // VBOs
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._effect);
            // Clear
            if (this.autoClear) {
                engine.clear(scene.clearColor, true, false, false);
            }
            // Draw order
            engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        }
        // Unbind
        engine.unBindFramebuffer(this._texture, this.isCube);
        if (this.onGenerated) {
            this.onGenerated();
        }
        this.onGeneratedObservable.notifyObservers(this);
    };
    /**
     * Clone the texture.
     * @returns the cloned texture
     */
    ProceduralTexture.prototype.clone = function () {
        var textureSize = this.getSize();
        var newTexture = new ProceduralTexture(this.name, textureSize.width, this._fragment, this.getScene(), this._fallbackTexture, this._generateMipMaps);
        // Base texture
        newTexture.hasAlpha = this.hasAlpha;
        newTexture.level = this.level;
        // RenderTarget Texture
        newTexture.coordinatesMode = this.coordinatesMode;
        return newTexture;
    };
    /**
     * Dispose the texture and release its asoociated resources.
     */
    ProceduralTexture.prototype.dispose = function () {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        var index = scene.proceduralTextures.indexOf(this);
        if (index >= 0) {
            scene.proceduralTextures.splice(index, 1);
        }
        var vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        if (this._indexBuffer && this._engine._releaseBuffer(this._indexBuffer)) {
            this._indexBuffer = null;
        }
        _super.prototype.dispose.call(this);
    };
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "autoClear", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "_generateMipMaps", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "_size", void 0);
    __decorate([
        serialize()
    ], ProceduralTexture.prototype, "refreshRate", null);
    return ProceduralTexture;
}(Texture));

export { ProceduralTexture as P, RenderTargetTexture as R, ProceduralTextureSceneComponent as a };

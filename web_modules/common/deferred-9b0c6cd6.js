import { t as Scalar, Q as Quaternion, a as Vector3, V as Vector2, X as Size, C as Color3, M as Matrix, ag as SerializationHelper, _ as _TypeStore, N as Node, c as __extends, p as Space, k as ArrayTools, h as Scene, j as Tmp, O as Observable, i as PrecisionDate, E as EngineStore, n as Mesh, g as AbstractScene, f as Engine, L as Logger, at as _DevTools, T as Tools, H as InternalTexture, d as Constants, F as Texture, D as DeepCopier, m as Camera, K as KeyboardEventTypes, r as __decorate, s as serialize, P as PointerEventTypes, v as Epsilon, q as Axis, w as serializeAsVector3, x as serializeAsMeshReference, z as Effect, an as SmartArray, a8 as __assign, $ as VertexBuffer, a9 as MaterialHelper, b as Color4, e as Vector4, aa as Material, ao as EffectFallbacks, aX as SceneLoaderFlags, aN as FilesInputStore, aw as Light, aj as serializeAsTexture, bm as serializeAsMatrix, ap as BaseTexture, ai as expandToProperty, ah as serializeAsColor3, af as MaterialFlags, bj as serializeAsVector2, am as MaterialDefines, Z as ImageProcessingConfiguration, ak as serializeAsImageProcessingConfiguration, al as PushMaterial, ar as SphericalPolynomial, a0 as VertexData } from './standardMaterial-daa84ac1.js';

/**
 * Enum for the animation key frame interpolation type
 */
var AnimationKeyInterpolation;
(function (AnimationKeyInterpolation) {
    /**
     * Do not interpolate between keys and use the start key value only. Tangents are ignored
     */
    AnimationKeyInterpolation[AnimationKeyInterpolation["STEP"] = 1] = "STEP";
})(AnimationKeyInterpolation || (AnimationKeyInterpolation = {}));

/**
 * Represents the range of an animation
 */
var AnimationRange = /** @class */ (function () {
    /**
     * Initializes the range of an animation
     * @param name The name of the animation range
     * @param from The starting frame of the animation
     * @param to The ending frame of the animation
     */
    function AnimationRange(
    /**The name of the animation range**/
    name, 
    /**The starting frame of the animation */
    from, 
    /**The ending frame of the animation*/
    to) {
        this.name = name;
        this.from = from;
        this.to = to;
    }
    /**
     * Makes a copy of the animation range
     * @returns A copy of the animation range
     */
    AnimationRange.prototype.clone = function () {
        return new AnimationRange(this.name, this.from, this.to);
    };
    return AnimationRange;
}());

/**
 * @hidden
 */
var _IAnimationState = /** @class */ (function () {
    function _IAnimationState() {
    }
    return _IAnimationState;
}());
/**
 * Class used to store any kind of animation
 */
var Animation = /** @class */ (function () {
    /**
     * Initializes the animation
     * @param name Name of the animation
     * @param targetProperty Property to animate
     * @param framePerSecond The frames per second of the animation
     * @param dataType The data type of the animation
     * @param loopMode The loop mode of the animation
     * @param enableBlending Specifies if blending should be enabled
     */
    function Animation(
    /**Name of the animation */
    name, 
    /**Property to animate */
    targetProperty, 
    /**The frames per second of the animation */
    framePerSecond, 
    /**The data type of the animation */
    dataType, 
    /**The loop mode of the animation */
    loopMode, 
    /**Specifies if blending should be enabled */
    enableBlending) {
        this.name = name;
        this.targetProperty = targetProperty;
        this.framePerSecond = framePerSecond;
        this.dataType = dataType;
        this.loopMode = loopMode;
        this.enableBlending = enableBlending;
        /**
         * @hidden Internal use only
         */
        this._runtimeAnimations = new Array();
        /**
         * The set of event that will be linked to this animation
         */
        this._events = new Array();
        /**
         * Stores the blending speed of the animation
         */
        this.blendingSpeed = 0.01;
        /**
         * Stores the animation ranges for the animation
         */
        this._ranges = {};
        this.targetPropertyPath = targetProperty.split(".");
        this.dataType = dataType;
        this.loopMode = loopMode === undefined ? Animation.ANIMATIONLOOPMODE_CYCLE : loopMode;
    }
    /**
     * @hidden Internal use
     */
    Animation._PrepareAnimation = function (name, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction) {
        var dataType = undefined;
        if (!isNaN(parseFloat(from)) && isFinite(from)) {
            dataType = Animation.ANIMATIONTYPE_FLOAT;
        }
        else if (from instanceof Quaternion) {
            dataType = Animation.ANIMATIONTYPE_QUATERNION;
        }
        else if (from instanceof Vector3) {
            dataType = Animation.ANIMATIONTYPE_VECTOR3;
        }
        else if (from instanceof Vector2) {
            dataType = Animation.ANIMATIONTYPE_VECTOR2;
        }
        else if (from instanceof Color3) {
            dataType = Animation.ANIMATIONTYPE_COLOR3;
        }
        else if (from instanceof Size) {
            dataType = Animation.ANIMATIONTYPE_SIZE;
        }
        if (dataType == undefined) {
            return null;
        }
        var animation = new Animation(name, targetProperty, framePerSecond, dataType, loopMode);
        var keys = [{ frame: 0, value: from }, { frame: totalFrame, value: to }];
        animation.setKeys(keys);
        if (easingFunction !== undefined) {
            animation.setEasingFunction(easingFunction);
        }
        return animation;
    };
    /**
     * Sets up an animation
     * @param property The property to animate
     * @param animationType The animation type to apply
     * @param framePerSecond The frames per second of the animation
     * @param easingFunction The easing function used in the animation
     * @returns The created animation
     */
    Animation.CreateAnimation = function (property, animationType, framePerSecond, easingFunction) {
        var animation = new Animation(property + "Animation", property, framePerSecond, animationType, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setEasingFunction(easingFunction);
        return animation;
    };
    /**
     * Create and start an animation on a node
     * @param name defines the name of the global animation that will be run on all nodes
     * @param node defines the root node where the animation will take place
     * @param targetProperty defines property to animate
     * @param framePerSecond defines the number of frame per second yo use
     * @param totalFrame defines the number of frames in total
     * @param from defines the initial value
     * @param to defines the final value
     * @param loopMode defines which loop mode you want to use (off by default)
     * @param easingFunction defines the easing function to use (linear by default)
     * @param onAnimationEnd defines the callback to call when animation end
     * @returns the animatable created for this animation
     */
    Animation.CreateAndStartAnimation = function (name, node, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction, onAnimationEnd) {
        var animation = Animation._PrepareAnimation(name, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction);
        if (!animation) {
            return null;
        }
        return node.getScene().beginDirectAnimation(node, [animation], 0, totalFrame, (animation.loopMode === 1), 1.0, onAnimationEnd);
    };
    /**
     * Create and start an animation on a node and its descendants
     * @param name defines the name of the global animation that will be run on all nodes
     * @param node defines the root node where the animation will take place
     * @param directDescendantsOnly if true only direct descendants will be used, if false direct and also indirect (children of children, an so on in a recursive manner) descendants will be used
     * @param targetProperty defines property to animate
     * @param framePerSecond defines the number of frame per second to use
     * @param totalFrame defines the number of frames in total
     * @param from defines the initial value
     * @param to defines the final value
     * @param loopMode defines which loop mode you want to use (off by default)
     * @param easingFunction defines the easing function to use (linear by default)
     * @param onAnimationEnd defines the callback to call when an animation ends (will be called once per node)
     * @returns the list of animatables created for all nodes
     * @example https://www.babylonjs-playground.com/#MH0VLI
     */
    Animation.CreateAndStartHierarchyAnimation = function (name, node, directDescendantsOnly, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction, onAnimationEnd) {
        var animation = Animation._PrepareAnimation(name, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction);
        if (!animation) {
            return null;
        }
        var scene = node.getScene();
        return scene.beginDirectHierarchyAnimation(node, directDescendantsOnly, [animation], 0, totalFrame, (animation.loopMode === 1), 1.0, onAnimationEnd);
    };
    /**
     * Creates a new animation, merges it with the existing animations and starts it
     * @param name Name of the animation
     * @param node Node which contains the scene that begins the animations
     * @param targetProperty Specifies which property to animate
     * @param framePerSecond The frames per second of the animation
     * @param totalFrame The total number of frames
     * @param from The frame at the beginning of the animation
     * @param to The frame at the end of the animation
     * @param loopMode Specifies the loop mode of the animation
     * @param easingFunction (Optional) The easing function of the animation, which allow custom mathematical formulas for animations
     * @param onAnimationEnd Callback to run once the animation is complete
     * @returns Nullable animation
     */
    Animation.CreateMergeAndStartAnimation = function (name, node, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction, onAnimationEnd) {
        var animation = Animation._PrepareAnimation(name, targetProperty, framePerSecond, totalFrame, from, to, loopMode, easingFunction);
        if (!animation) {
            return null;
        }
        node.animations.push(animation);
        return node.getScene().beginAnimation(node, 0, totalFrame, (animation.loopMode === 1), 1.0, onAnimationEnd);
    };
    /**
     * Transition property of an host to the target Value
     * @param property The property to transition
     * @param targetValue The target Value of the property
     * @param host The object where the property to animate belongs
     * @param scene Scene used to run the animation
     * @param frameRate Framerate (in frame/s) to use
     * @param transition The transition type we want to use
     * @param duration The duration of the animation, in milliseconds
     * @param onAnimationEnd Callback trigger at the end of the animation
     * @returns Nullable animation
     */
    Animation.TransitionTo = function (property, targetValue, host, scene, frameRate, transition, duration, onAnimationEnd) {
        if (onAnimationEnd === void 0) { onAnimationEnd = null; }
        if (duration <= 0) {
            host[property] = targetValue;
            if (onAnimationEnd) {
                onAnimationEnd();
            }
            return null;
        }
        var endFrame = frameRate * (duration / 1000);
        transition.setKeys([{
                frame: 0,
                value: host[property].clone ? host[property].clone() : host[property]
            },
            {
                frame: endFrame,
                value: targetValue
            }]);
        if (!host.animations) {
            host.animations = [];
        }
        host.animations.push(transition);
        var animation = scene.beginAnimation(host, 0, endFrame, false);
        animation.onAnimationEnd = onAnimationEnd;
        return animation;
    };
    Object.defineProperty(Animation.prototype, "runtimeAnimations", {
        /**
         * Return the array of runtime animations currently using this animation
         */
        get: function () {
            return this._runtimeAnimations;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "hasRunningRuntimeAnimations", {
        /**
         * Specifies if any of the runtime animations are currently running
         */
        get: function () {
            for (var _i = 0, _a = this._runtimeAnimations; _i < _a.length; _i++) {
                var runtimeAnimation = _a[_i];
                if (!runtimeAnimation.isStopped) {
                    return true;
                }
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    // Methods
    /**
     * Converts the animation to a string
     * @param fullDetails support for multiple levels of logging within scene loading
     * @returns String form of the animation
     */
    Animation.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name + ", property: " + this.targetProperty;
        ret += ", datatype: " + (["Float", "Vector3", "Quaternion", "Matrix", "Color3", "Vector2"])[this.dataType];
        ret += ", nKeys: " + (this._keys ? this._keys.length : "none");
        ret += ", nRanges: " + (this._ranges ? Object.keys(this._ranges).length : "none");
        if (fullDetails) {
            ret += ", Ranges: {";
            var first = true;
            for (var name in this._ranges) {
                if (first) {
                    ret += ", ";
                    first = false;
                }
                ret += name;
            }
            ret += "}";
        }
        return ret;
    };
    /**
     * Add an event to this animation
     * @param event Event to add
     */
    Animation.prototype.addEvent = function (event) {
        this._events.push(event);
    };
    /**
     * Remove all events found at the given frame
     * @param frame The frame to remove events from
     */
    Animation.prototype.removeEvents = function (frame) {
        for (var index = 0; index < this._events.length; index++) {
            if (this._events[index].frame === frame) {
                this._events.splice(index, 1);
                index--;
            }
        }
    };
    /**
     * Retrieves all the events from the animation
     * @returns Events from the animation
     */
    Animation.prototype.getEvents = function () {
        return this._events;
    };
    /**
     * Creates an animation range
     * @param name Name of the animation range
     * @param from Starting frame of the animation range
     * @param to Ending frame of the animation
     */
    Animation.prototype.createRange = function (name, from, to) {
        // check name not already in use; could happen for bones after serialized
        if (!this._ranges[name]) {
            this._ranges[name] = new AnimationRange(name, from, to);
        }
    };
    /**
     * Deletes an animation range by name
     * @param name Name of the animation range to delete
     * @param deleteFrames Specifies if the key frames for the range should also be deleted (true) or not (false)
     */
    Animation.prototype.deleteRange = function (name, deleteFrames) {
        if (deleteFrames === void 0) { deleteFrames = true; }
        var range = this._ranges[name];
        if (!range) {
            return;
        }
        if (deleteFrames) {
            var from = range.from;
            var to = range.to;
            // this loop MUST go high to low for multiple splices to work
            for (var key = this._keys.length - 1; key >= 0; key--) {
                if (this._keys[key].frame >= from && this._keys[key].frame <= to) {
                    this._keys.splice(key, 1);
                }
            }
        }
        this._ranges[name] = null; // said much faster than 'delete this._range[name]'
    };
    /**
     * Gets the animation range by name, or null if not defined
     * @param name Name of the animation range
     * @returns Nullable animation range
     */
    Animation.prototype.getRange = function (name) {
        return this._ranges[name];
    };
    /**
     * Gets the key frames from the animation
     * @returns The key frames of the animation
     */
    Animation.prototype.getKeys = function () {
        return this._keys;
    };
    /**
     * Gets the highest frame rate of the animation
     * @returns Highest frame rate of the animation
     */
    Animation.prototype.getHighestFrame = function () {
        var ret = 0;
        for (var key = 0, nKeys = this._keys.length; key < nKeys; key++) {
            if (ret < this._keys[key].frame) {
                ret = this._keys[key].frame;
            }
        }
        return ret;
    };
    /**
     * Gets the easing function of the animation
     * @returns Easing function of the animation
     */
    Animation.prototype.getEasingFunction = function () {
        return this._easingFunction;
    };
    /**
     * Sets the easing function of the animation
     * @param easingFunction A custom mathematical formula for animation
     */
    Animation.prototype.setEasingFunction = function (easingFunction) {
        this._easingFunction = easingFunction;
    };
    /**
     * Interpolates a scalar linearly
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated scalar value
     */
    Animation.prototype.floatInterpolateFunction = function (startValue, endValue, gradient) {
        return Scalar.Lerp(startValue, endValue, gradient);
    };
    /**
     * Interpolates a scalar cubically
     * @param startValue Start value of the animation curve
     * @param outTangent End tangent of the animation
     * @param endValue End value of the animation curve
     * @param inTangent Start tangent of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated scalar value
     */
    Animation.prototype.floatInterpolateFunctionWithTangents = function (startValue, outTangent, endValue, inTangent, gradient) {
        return Scalar.Hermite(startValue, outTangent, endValue, inTangent, gradient);
    };
    /**
     * Interpolates a quaternion using a spherical linear interpolation
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated quaternion value
     */
    Animation.prototype.quaternionInterpolateFunction = function (startValue, endValue, gradient) {
        return Quaternion.Slerp(startValue, endValue, gradient);
    };
    /**
     * Interpolates a quaternion cubically
     * @param startValue Start value of the animation curve
     * @param outTangent End tangent of the animation curve
     * @param endValue End value of the animation curve
     * @param inTangent Start tangent of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated quaternion value
     */
    Animation.prototype.quaternionInterpolateFunctionWithTangents = function (startValue, outTangent, endValue, inTangent, gradient) {
        return Quaternion.Hermite(startValue, outTangent, endValue, inTangent, gradient).normalize();
    };
    /**
     * Interpolates a Vector3 linearl
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated scalar value
     */
    Animation.prototype.vector3InterpolateFunction = function (startValue, endValue, gradient) {
        return Vector3.Lerp(startValue, endValue, gradient);
    };
    /**
     * Interpolates a Vector3 cubically
     * @param startValue Start value of the animation curve
     * @param outTangent End tangent of the animation
     * @param endValue End value of the animation curve
     * @param inTangent Start tangent of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns InterpolatedVector3 value
     */
    Animation.prototype.vector3InterpolateFunctionWithTangents = function (startValue, outTangent, endValue, inTangent, gradient) {
        return Vector3.Hermite(startValue, outTangent, endValue, inTangent, gradient);
    };
    /**
     * Interpolates a Vector2 linearly
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated Vector2 value
     */
    Animation.prototype.vector2InterpolateFunction = function (startValue, endValue, gradient) {
        return Vector2.Lerp(startValue, endValue, gradient);
    };
    /**
     * Interpolates a Vector2 cubically
     * @param startValue Start value of the animation curve
     * @param outTangent End tangent of the animation
     * @param endValue End value of the animation curve
     * @param inTangent Start tangent of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated Vector2 value
     */
    Animation.prototype.vector2InterpolateFunctionWithTangents = function (startValue, outTangent, endValue, inTangent, gradient) {
        return Vector2.Hermite(startValue, outTangent, endValue, inTangent, gradient);
    };
    /**
     * Interpolates a size linearly
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated Size value
     */
    Animation.prototype.sizeInterpolateFunction = function (startValue, endValue, gradient) {
        return Size.Lerp(startValue, endValue, gradient);
    };
    /**
     * Interpolates a Color3 linearly
     * @param startValue Start value of the animation curve
     * @param endValue End value of the animation curve
     * @param gradient Scalar amount to interpolate
     * @returns Interpolated Color3 value
     */
    Animation.prototype.color3InterpolateFunction = function (startValue, endValue, gradient) {
        return Color3.Lerp(startValue, endValue, gradient);
    };
    /**
     * @hidden Internal use only
     */
    Animation.prototype._getKeyValue = function (value) {
        if (typeof value === "function") {
            return value();
        }
        return value;
    };
    /**
     * @hidden Internal use only
     */
    Animation.prototype._interpolate = function (currentFrame, state) {
        if (state.loopMode === Animation.ANIMATIONLOOPMODE_CONSTANT && state.repeatCount > 0) {
            return state.highLimitValue.clone ? state.highLimitValue.clone() : state.highLimitValue;
        }
        var keys = this._keys;
        if (keys.length === 1) {
            return this._getKeyValue(keys[0].value);
        }
        var startKeyIndex = state.key;
        if (keys[startKeyIndex].frame >= currentFrame) {
            while (startKeyIndex - 1 >= 0 && keys[startKeyIndex].frame >= currentFrame) {
                startKeyIndex--;
            }
        }
        for (var key = startKeyIndex; key < keys.length; key++) {
            var endKey = keys[key + 1];
            if (endKey.frame >= currentFrame) {
                state.key = key;
                var startKey = keys[key];
                var startValue = this._getKeyValue(startKey.value);
                if (startKey.interpolation === AnimationKeyInterpolation.STEP) {
                    return startValue;
                }
                var endValue = this._getKeyValue(endKey.value);
                var useTangent = startKey.outTangent !== undefined && endKey.inTangent !== undefined;
                var frameDelta = endKey.frame - startKey.frame;
                // gradient : percent of currentFrame between the frame inf and the frame sup
                var gradient = (currentFrame - startKey.frame) / frameDelta;
                // check for easingFunction and correction of gradient
                var easingFunction = this.getEasingFunction();
                if (easingFunction != null) {
                    gradient = easingFunction.ease(gradient);
                }
                switch (this.dataType) {
                    // Float
                    case Animation.ANIMATIONTYPE_FLOAT:
                        var floatValue = useTangent ? this.floatInterpolateFunctionWithTangents(startValue, startKey.outTangent * frameDelta, endValue, endKey.inTangent * frameDelta, gradient) : this.floatInterpolateFunction(startValue, endValue, gradient);
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return floatValue;
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return state.offsetValue * state.repeatCount + floatValue;
                        }
                        break;
                    // Quaternion
                    case Animation.ANIMATIONTYPE_QUATERNION:
                        var quatValue = useTangent ? this.quaternionInterpolateFunctionWithTangents(startValue, startKey.outTangent.scale(frameDelta), endValue, endKey.inTangent.scale(frameDelta), gradient) : this.quaternionInterpolateFunction(startValue, endValue, gradient);
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return quatValue;
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return quatValue.addInPlace(state.offsetValue.scale(state.repeatCount));
                        }
                        return quatValue;
                    // Vector3
                    case Animation.ANIMATIONTYPE_VECTOR3:
                        var vec3Value = useTangent ? this.vector3InterpolateFunctionWithTangents(startValue, startKey.outTangent.scale(frameDelta), endValue, endKey.inTangent.scale(frameDelta), gradient) : this.vector3InterpolateFunction(startValue, endValue, gradient);
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return vec3Value;
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return vec3Value.add(state.offsetValue.scale(state.repeatCount));
                        }
                    // Vector2
                    case Animation.ANIMATIONTYPE_VECTOR2:
                        var vec2Value = useTangent ? this.vector2InterpolateFunctionWithTangents(startValue, startKey.outTangent.scale(frameDelta), endValue, endKey.inTangent.scale(frameDelta), gradient) : this.vector2InterpolateFunction(startValue, endValue, gradient);
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return vec2Value;
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return vec2Value.add(state.offsetValue.scale(state.repeatCount));
                        }
                    // Size
                    case Animation.ANIMATIONTYPE_SIZE:
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return this.sizeInterpolateFunction(startValue, endValue, gradient);
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return this.sizeInterpolateFunction(startValue, endValue, gradient).add(state.offsetValue.scale(state.repeatCount));
                        }
                    // Color3
                    case Animation.ANIMATIONTYPE_COLOR3:
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                return this.color3InterpolateFunction(startValue, endValue, gradient);
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return this.color3InterpolateFunction(startValue, endValue, gradient).add(state.offsetValue.scale(state.repeatCount));
                        }
                    // Matrix
                    case Animation.ANIMATIONTYPE_MATRIX:
                        switch (state.loopMode) {
                            case Animation.ANIMATIONLOOPMODE_CYCLE:
                            case Animation.ANIMATIONLOOPMODE_CONSTANT:
                                if (Animation.AllowMatricesInterpolation) {
                                    return this.matrixInterpolateFunction(startValue, endValue, gradient, state.workValue);
                                }
                            case Animation.ANIMATIONLOOPMODE_RELATIVE:
                                return startValue;
                        }
                }
                break;
            }
        }
        return this._getKeyValue(keys[keys.length - 1].value);
    };
    /**
     * Defines the function to use to interpolate matrices
     * @param startValue defines the start matrix
     * @param endValue defines the end matrix
     * @param gradient defines the gradient between both matrices
     * @param result defines an optional target matrix where to store the interpolation
     * @returns the interpolated matrix
     */
    Animation.prototype.matrixInterpolateFunction = function (startValue, endValue, gradient, result) {
        if (Animation.AllowMatrixDecomposeForInterpolation) {
            if (result) {
                Matrix.DecomposeLerpToRef(startValue, endValue, gradient, result);
                return result;
            }
            return Matrix.DecomposeLerp(startValue, endValue, gradient);
        }
        if (result) {
            Matrix.LerpToRef(startValue, endValue, gradient, result);
            return result;
        }
        return Matrix.Lerp(startValue, endValue, gradient);
    };
    /**
     * Makes a copy of the animation
     * @returns Cloned animation
     */
    Animation.prototype.clone = function () {
        var clone = new Animation(this.name, this.targetPropertyPath.join("."), this.framePerSecond, this.dataType, this.loopMode);
        clone.enableBlending = this.enableBlending;
        clone.blendingSpeed = this.blendingSpeed;
        if (this._keys) {
            clone.setKeys(this._keys);
        }
        if (this._ranges) {
            clone._ranges = {};
            for (var name in this._ranges) {
                var range = this._ranges[name];
                if (!range) {
                    continue;
                }
                clone._ranges[name] = range.clone();
            }
        }
        return clone;
    };
    /**
     * Sets the key frames of the animation
     * @param values The animation key frames to set
     */
    Animation.prototype.setKeys = function (values) {
        this._keys = values.slice(0);
    };
    /**
     * Serializes the animation to an object
     * @returns Serialized object
     */
    Animation.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.property = this.targetProperty;
        serializationObject.framePerSecond = this.framePerSecond;
        serializationObject.dataType = this.dataType;
        serializationObject.loopBehavior = this.loopMode;
        serializationObject.enableBlending = this.enableBlending;
        serializationObject.blendingSpeed = this.blendingSpeed;
        var dataType = this.dataType;
        serializationObject.keys = [];
        var keys = this.getKeys();
        for (var index = 0; index < keys.length; index++) {
            var animationKey = keys[index];
            var key = {};
            key.frame = animationKey.frame;
            switch (dataType) {
                case Animation.ANIMATIONTYPE_FLOAT:
                    key.values = [animationKey.value];
                    break;
                case Animation.ANIMATIONTYPE_QUATERNION:
                case Animation.ANIMATIONTYPE_MATRIX:
                case Animation.ANIMATIONTYPE_VECTOR3:
                case Animation.ANIMATIONTYPE_COLOR3:
                    key.values = animationKey.value.asArray();
                    break;
            }
            serializationObject.keys.push(key);
        }
        serializationObject.ranges = [];
        for (var name in this._ranges) {
            var source = this._ranges[name];
            if (!source) {
                continue;
            }
            var range = {};
            range.name = name;
            range.from = source.from;
            range.to = source.to;
            serializationObject.ranges.push(range);
        }
        return serializationObject;
    };
    Object.defineProperty(Animation, "ANIMATIONTYPE_FLOAT", {
        /**
         * Get the float animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_FLOAT;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_VECTOR3", {
        /**
         * Get the Vector3 animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_VECTOR3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_VECTOR2", {
        /**
         * Get the Vector2 animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_VECTOR2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_SIZE", {
        /**
         * Get the Size animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_SIZE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_QUATERNION", {
        /**
         * Get the Quaternion animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_QUATERNION;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_MATRIX", {
        /**
         * Get the Matrix animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_MATRIX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONTYPE_COLOR3", {
        /**
         * Get the Color3 animation type
         */
        get: function () {
            return Animation._ANIMATIONTYPE_COLOR3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONLOOPMODE_RELATIVE", {
        /**
         * Get the Relative Loop Mode
         */
        get: function () {
            return Animation._ANIMATIONLOOPMODE_RELATIVE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONLOOPMODE_CYCLE", {
        /**
         * Get the Cycle Loop Mode
         */
        get: function () {
            return Animation._ANIMATIONLOOPMODE_CYCLE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation, "ANIMATIONLOOPMODE_CONSTANT", {
        /**
         * Get the Constant Loop Mode
         */
        get: function () {
            return Animation._ANIMATIONLOOPMODE_CONSTANT;
        },
        enumerable: true,
        configurable: true
    });
    /** @hidden */
    Animation._UniversalLerp = function (left, right, amount) {
        var constructor = left.constructor;
        if (constructor.Lerp) { // Lerp supported
            return constructor.Lerp(left, right, amount);
        }
        else if (constructor.Slerp) { // Slerp supported
            return constructor.Slerp(left, right, amount);
        }
        else if (left.toFixed) { // Number
            return left * (1.0 - amount) + amount * right;
        }
        else { // Blending not supported
            return right;
        }
    };
    /**
     * Parses an animation object and creates an animation
     * @param parsedAnimation Parsed animation object
     * @returns Animation object
     */
    Animation.Parse = function (parsedAnimation) {
        var animation = new Animation(parsedAnimation.name, parsedAnimation.property, parsedAnimation.framePerSecond, parsedAnimation.dataType, parsedAnimation.loopBehavior);
        var dataType = parsedAnimation.dataType;
        var keys = [];
        var data;
        var index;
        if (parsedAnimation.enableBlending) {
            animation.enableBlending = parsedAnimation.enableBlending;
        }
        if (parsedAnimation.blendingSpeed) {
            animation.blendingSpeed = parsedAnimation.blendingSpeed;
        }
        for (index = 0; index < parsedAnimation.keys.length; index++) {
            var key = parsedAnimation.keys[index];
            var inTangent;
            var outTangent;
            switch (dataType) {
                case Animation.ANIMATIONTYPE_FLOAT:
                    data = key.values[0];
                    if (key.values.length >= 1) {
                        inTangent = key.values[1];
                    }
                    if (key.values.length >= 2) {
                        outTangent = key.values[2];
                    }
                    break;
                case Animation.ANIMATIONTYPE_QUATERNION:
                    data = Quaternion.FromArray(key.values);
                    if (key.values.length >= 8) {
                        var _inTangent = Quaternion.FromArray(key.values.slice(4, 8));
                        if (!_inTangent.equals(Quaternion.Zero())) {
                            inTangent = _inTangent;
                        }
                    }
                    if (key.values.length >= 12) {
                        var _outTangent = Quaternion.FromArray(key.values.slice(8, 12));
                        if (!_outTangent.equals(Quaternion.Zero())) {
                            outTangent = _outTangent;
                        }
                    }
                    break;
                case Animation.ANIMATIONTYPE_MATRIX:
                    data = Matrix.FromArray(key.values);
                    break;
                case Animation.ANIMATIONTYPE_COLOR3:
                    data = Color3.FromArray(key.values);
                    break;
                case Animation.ANIMATIONTYPE_VECTOR3:
                default:
                    data = Vector3.FromArray(key.values);
                    break;
            }
            var keyData = {};
            keyData.frame = key.frame;
            keyData.value = data;
            if (inTangent != undefined) {
                keyData.inTangent = inTangent;
            }
            if (outTangent != undefined) {
                keyData.outTangent = outTangent;
            }
            keys.push(keyData);
        }
        animation.setKeys(keys);
        if (parsedAnimation.ranges) {
            for (index = 0; index < parsedAnimation.ranges.length; index++) {
                data = parsedAnimation.ranges[index];
                animation.createRange(data.name, data.from, data.to);
            }
        }
        return animation;
    };
    /**
     * Appends the serialized animations from the source animations
     * @param source Source containing the animations
     * @param destination Target to store the animations
     */
    Animation.AppendSerializedAnimations = function (source, destination) {
        SerializationHelper.AppendSerializedAnimations(source, destination);
    };
    /**
     * Use matrix interpolation instead of using direct key value when animating matrices
     */
    Animation.AllowMatricesInterpolation = false;
    /**
     * When matrix interpolation is enabled, this boolean forces the system to use Matrix.DecomposeLerp instead of Matrix.Lerp. Interpolation is more precise but slower
     */
    Animation.AllowMatrixDecomposeForInterpolation = true;
    // Statics
    /**
     * Float animation type
     */
    Animation._ANIMATIONTYPE_FLOAT = 0;
    /**
     * Vector3 animation type
     */
    Animation._ANIMATIONTYPE_VECTOR3 = 1;
    /**
     * Quaternion animation type
     */
    Animation._ANIMATIONTYPE_QUATERNION = 2;
    /**
     * Matrix animation type
     */
    Animation._ANIMATIONTYPE_MATRIX = 3;
    /**
     * Color3 animation type
     */
    Animation._ANIMATIONTYPE_COLOR3 = 4;
    /**
     * Vector2 animation type
     */
    Animation._ANIMATIONTYPE_VECTOR2 = 5;
    /**
     * Size animation type
     */
    Animation._ANIMATIONTYPE_SIZE = 6;
    /**
     * Relative Loop Mode
     */
    Animation._ANIMATIONLOOPMODE_RELATIVE = 0;
    /**
     * Cycle Loop Mode
     */
    Animation._ANIMATIONLOOPMODE_CYCLE = 1;
    /**
     * Constant Loop Mode
     */
    Animation._ANIMATIONLOOPMODE_CONSTANT = 2;
    return Animation;
}());
_TypeStore.RegisteredTypes["BABYLON.Animation"] = Animation;
Node._AnimationRangeFactory = function (name, from, to) { return new AnimationRange(name, from, to); };

// Static values to help the garbage collector
// Quaternion
var _staticOffsetValueQuaternion = Object.freeze(new Quaternion(0, 0, 0, 0));
// Vector3
var _staticOffsetValueVector3 = Object.freeze(Vector3.Zero());
// Vector2
var _staticOffsetValueVector2 = Object.freeze(Vector2.Zero());
// Size
var _staticOffsetValueSize = Object.freeze(Size.Zero());
// Color3
var _staticOffsetValueColor3 = Object.freeze(Color3.Black());
/**
 * Defines a runtime animation
 */
var RuntimeAnimation = /** @class */ (function () {
    /**
     * Create a new RuntimeAnimation object
     * @param target defines the target of the animation
     * @param animation defines the source animation object
     * @param scene defines the hosting scene
     * @param host defines the initiating Animatable
     */
    function RuntimeAnimation(target, animation, scene, host) {
        var _this = this;
        this._events = new Array();
        /**
         * The current frame of the runtime animation
         */
        this._currentFrame = 0;
        /**
         * The original value of the runtime animation
         */
        this._originalValue = new Array();
        /**
         * The original blend value of the runtime animation
         */
        this._originalBlendValue = null;
        /**
         * The offsets cache of the runtime animation
         */
        this._offsetsCache = {};
        /**
         * The high limits cache of the runtime animation
         */
        this._highLimitsCache = {};
        /**
         * Specifies if the runtime animation has been stopped
         */
        this._stopped = false;
        /**
         * The blending factor of the runtime animation
         */
        this._blendingFactor = 0;
        /**
         * The current value of the runtime animation
         */
        this._currentValue = null;
        this._currentActiveTarget = null;
        this._directTarget = null;
        /**
         * The target path of the runtime animation
         */
        this._targetPath = "";
        /**
         * The weight of the runtime animation
         */
        this._weight = 1.0;
        /**
         * The ratio offset of the runtime animation
         */
        this._ratioOffset = 0;
        /**
         * The previous delay of the runtime animation
         */
        this._previousDelay = 0;
        /**
         * The previous ratio of the runtime animation
         */
        this._previousRatio = 0;
        this._targetIsArray = false;
        this._animation = animation;
        this._target = target;
        this._scene = scene;
        this._host = host;
        this._activeTargets = [];
        animation._runtimeAnimations.push(this);
        // State
        this._animationState = {
            key: 0,
            repeatCount: 0,
            loopMode: this._getCorrectLoopMode()
        };
        if (this._animation.dataType === Animation.ANIMATIONTYPE_MATRIX) {
            this._animationState.workValue = Matrix.Zero();
        }
        // Limits
        this._keys = this._animation.getKeys();
        this._minFrame = this._keys[0].frame;
        this._maxFrame = this._keys[this._keys.length - 1].frame;
        this._minValue = this._keys[0].value;
        this._maxValue = this._keys[this._keys.length - 1].value;
        // Add a start key at frame 0 if missing
        if (this._minFrame !== 0) {
            var newKey = { frame: 0, value: this._minValue };
            this._keys.splice(0, 0, newKey);
        }
        // Check data
        if (this._target instanceof Array) {
            var index = 0;
            for (var _i = 0, _a = this._target; _i < _a.length; _i++) {
                var target_1 = _a[_i];
                this._preparePath(target_1, index);
                this._getOriginalValues(index);
                index++;
            }
            this._targetIsArray = true;
        }
        else {
            this._preparePath(this._target);
            this._getOriginalValues();
            this._targetIsArray = false;
            this._directTarget = this._activeTargets[0];
        }
        // Cloning events locally
        var events = animation.getEvents();
        if (events && events.length > 0) {
            events.forEach(function (e) {
                _this._events.push(e._clone());
            });
        }
        this._enableBlending = target && target.animationPropertiesOverride ? target.animationPropertiesOverride.enableBlending : this._animation.enableBlending;
    }
    Object.defineProperty(RuntimeAnimation.prototype, "currentFrame", {
        /**
         * Gets the current frame of the runtime animation
         */
        get: function () {
            return this._currentFrame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeAnimation.prototype, "weight", {
        /**
         * Gets the weight of the runtime animation
         */
        get: function () {
            return this._weight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeAnimation.prototype, "currentValue", {
        /**
         * Gets the current value of the runtime animation
         */
        get: function () {
            return this._currentValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeAnimation.prototype, "targetPath", {
        /**
         * Gets the target path of the runtime animation
         */
        get: function () {
            return this._targetPath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RuntimeAnimation.prototype, "target", {
        /**
         * Gets the actual target of the runtime animation
         */
        get: function () {
            return this._currentActiveTarget;
        },
        enumerable: true,
        configurable: true
    });
    RuntimeAnimation.prototype._preparePath = function (target, targetIndex) {
        if (targetIndex === void 0) { targetIndex = 0; }
        var targetPropertyPath = this._animation.targetPropertyPath;
        if (targetPropertyPath.length > 1) {
            var property = target[targetPropertyPath[0]];
            for (var index = 1; index < targetPropertyPath.length - 1; index++) {
                property = property[targetPropertyPath[index]];
            }
            this._targetPath = targetPropertyPath[targetPropertyPath.length - 1];
            this._activeTargets[targetIndex] = property;
        }
        else {
            this._targetPath = targetPropertyPath[0];
            this._activeTargets[targetIndex] = target;
        }
    };
    Object.defineProperty(RuntimeAnimation.prototype, "animation", {
        /**
         * Gets the animation from the runtime animation
         */
        get: function () {
            return this._animation;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the runtime animation to the beginning
     * @param restoreOriginal defines whether to restore the target property to the original value
     */
    RuntimeAnimation.prototype.reset = function (restoreOriginal) {
        if (restoreOriginal === void 0) { restoreOriginal = false; }
        if (restoreOriginal) {
            if (this._target instanceof Array) {
                var index = 0;
                for (var _i = 0, _a = this._target; _i < _a.length; _i++) {
                    var target = _a[_i];
                    if (this._originalValue[index] !== undefined) {
                        this._setValue(target, this._activeTargets[index], this._originalValue[index], -1, index);
                    }
                    index++;
                }
            }
            else {
                if (this._originalValue[0] !== undefined) {
                    this._setValue(this._target, this._directTarget, this._originalValue[0], -1, 0);
                }
            }
        }
        this._offsetsCache = {};
        this._highLimitsCache = {};
        this._currentFrame = 0;
        this._blendingFactor = 0;
        // Events
        for (var index = 0; index < this._events.length; index++) {
            this._events[index].isDone = false;
        }
    };
    /**
     * Specifies if the runtime animation is stopped
     * @returns Boolean specifying if the runtime animation is stopped
     */
    RuntimeAnimation.prototype.isStopped = function () {
        return this._stopped;
    };
    /**
     * Disposes of the runtime animation
     */
    RuntimeAnimation.prototype.dispose = function () {
        var index = this._animation.runtimeAnimations.indexOf(this);
        if (index > -1) {
            this._animation.runtimeAnimations.splice(index, 1);
        }
    };
    /**
     * Apply the interpolated value to the target
     * @param currentValue defines the value computed by the animation
     * @param weight defines the weight to apply to this value (Defaults to 1.0)
     */
    RuntimeAnimation.prototype.setValue = function (currentValue, weight) {
        if (this._targetIsArray) {
            for (var index = 0; index < this._target.length; index++) {
                var target = this._target[index];
                this._setValue(target, this._activeTargets[index], currentValue, weight, index);
            }
            return;
        }
        this._setValue(this._target, this._directTarget, currentValue, weight, 0);
    };
    RuntimeAnimation.prototype._getOriginalValues = function (targetIndex) {
        if (targetIndex === void 0) { targetIndex = 0; }
        var originalValue;
        var target = this._activeTargets[targetIndex];
        if (target.getRestPose && this._targetPath === "_matrix") { // For bones
            originalValue = target.getRestPose();
        }
        else {
            originalValue = target[this._targetPath];
        }
        if (originalValue && originalValue.clone) {
            this._originalValue[targetIndex] = originalValue.clone();
        }
        else {
            this._originalValue[targetIndex] = originalValue;
        }
    };
    RuntimeAnimation.prototype._setValue = function (target, destination, currentValue, weight, targetIndex) {
        // Set value
        this._currentActiveTarget = destination;
        this._weight = weight;
        if (this._enableBlending && this._blendingFactor <= 1.0) {
            if (!this._originalBlendValue) {
                var originalValue = destination[this._targetPath];
                if (originalValue.clone) {
                    this._originalBlendValue = originalValue.clone();
                }
                else {
                    this._originalBlendValue = originalValue;
                }
            }
            if (this._originalBlendValue.m) { // Matrix
                if (Animation.AllowMatrixDecomposeForInterpolation) {
                    if (this._currentValue) {
                        Matrix.DecomposeLerpToRef(this._originalBlendValue, currentValue, this._blendingFactor, this._currentValue);
                    }
                    else {
                        this._currentValue = Matrix.DecomposeLerp(this._originalBlendValue, currentValue, this._blendingFactor);
                    }
                }
                else {
                    if (this._currentValue) {
                        Matrix.LerpToRef(this._originalBlendValue, currentValue, this._blendingFactor, this._currentValue);
                    }
                    else {
                        this._currentValue = Matrix.Lerp(this._originalBlendValue, currentValue, this._blendingFactor);
                    }
                }
            }
            else {
                this._currentValue = Animation._UniversalLerp(this._originalBlendValue, currentValue, this._blendingFactor);
            }
            var blendingSpeed = target && target.animationPropertiesOverride ? target.animationPropertiesOverride.blendingSpeed : this._animation.blendingSpeed;
            this._blendingFactor += blendingSpeed;
        }
        else {
            this._currentValue = currentValue;
        }
        if (weight !== -1.0) {
            this._scene._registerTargetForLateAnimationBinding(this, this._originalValue[targetIndex]);
        }
        else {
            destination[this._targetPath] = this._currentValue;
        }
        if (target.markAsDirty) {
            target.markAsDirty(this._animation.targetProperty);
        }
    };
    /**
     * Gets the loop pmode of the runtime animation
     * @returns Loop Mode
     */
    RuntimeAnimation.prototype._getCorrectLoopMode = function () {
        if (this._target && this._target.animationPropertiesOverride) {
            return this._target.animationPropertiesOverride.loopMode;
        }
        return this._animation.loopMode;
    };
    /**
     * Move the current animation to a given frame
     * @param frame defines the frame to move to
     */
    RuntimeAnimation.prototype.goToFrame = function (frame) {
        var keys = this._animation.getKeys();
        if (frame < keys[0].frame) {
            frame = keys[0].frame;
        }
        else if (frame > keys[keys.length - 1].frame) {
            frame = keys[keys.length - 1].frame;
        }
        this._currentFrame = frame;
        var currentValue = this._animation._interpolate(frame, this._animationState);
        this.setValue(currentValue, -1);
    };
    /**
     * @hidden Internal use only
     */
    RuntimeAnimation.prototype._prepareForSpeedRatioChange = function (newSpeedRatio) {
        var newRatio = this._previousDelay * (this._animation.framePerSecond * newSpeedRatio) / 1000.0;
        this._ratioOffset = this._previousRatio - newRatio;
    };
    /**
     * Execute the current animation
     * @param delay defines the delay to add to the current frame
     * @param from defines the lower bound of the animation range
     * @param to defines the upper bound of the animation range
     * @param loop defines if the current animation must loop
     * @param speedRatio defines the current speed ratio
     * @param weight defines the weight of the animation (default is -1 so no weight)
     * @param onLoop optional callback called when animation loops
     * @returns a boolean indicating if the animation is running
     */
    RuntimeAnimation.prototype.animate = function (delay, from, to, loop, speedRatio, weight) {
        if (weight === void 0) { weight = -1.0; }
        var animation = this._animation;
        var targetPropertyPath = animation.targetPropertyPath;
        if (!targetPropertyPath || targetPropertyPath.length < 1) {
            this._stopped = true;
            return false;
        }
        var returnValue = true;
        // Check limits
        if (from < this._minFrame || from > this._maxFrame) {
            from = this._minFrame;
        }
        if (to < this._minFrame || to > this._maxFrame) {
            to = this._maxFrame;
        }
        var range = to - from;
        var offsetValue;
        // Compute ratio which represents the frame delta between from and to
        var ratio = (delay * (animation.framePerSecond * speedRatio) / 1000.0) + this._ratioOffset;
        var highLimitValue = 0;
        this._previousDelay = delay;
        this._previousRatio = ratio;
        if (!loop && (to >= from && ratio >= range)) { // If we are out of range and not looping get back to caller
            returnValue = false;
            highLimitValue = animation._getKeyValue(this._maxValue);
        }
        else if (!loop && (from >= to && ratio <= range)) {
            returnValue = false;
            highLimitValue = animation._getKeyValue(this._minValue);
        }
        else if (this._animationState.loopMode !== Animation.ANIMATIONLOOPMODE_CYCLE) {
            var keyOffset = to.toString() + from.toString();
            if (!this._offsetsCache[keyOffset]) {
                this._animationState.repeatCount = 0;
                this._animationState.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
                var fromValue = animation._interpolate(from, this._animationState);
                var toValue = animation._interpolate(to, this._animationState);
                this._animationState.loopMode = this._getCorrectLoopMode();
                switch (animation.dataType) {
                    // Float
                    case Animation.ANIMATIONTYPE_FLOAT:
                        this._offsetsCache[keyOffset] = toValue - fromValue;
                        break;
                    // Quaternion
                    case Animation.ANIMATIONTYPE_QUATERNION:
                        this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
                        break;
                    // Vector3
                    case Animation.ANIMATIONTYPE_VECTOR3:
                        this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
                    // Vector2
                    case Animation.ANIMATIONTYPE_VECTOR2:
                        this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
                    // Size
                    case Animation.ANIMATIONTYPE_SIZE:
                        this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
                    // Color3
                    case Animation.ANIMATIONTYPE_COLOR3:
                        this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
                }
                this._highLimitsCache[keyOffset] = toValue;
            }
            highLimitValue = this._highLimitsCache[keyOffset];
            offsetValue = this._offsetsCache[keyOffset];
        }
        if (offsetValue === undefined) {
            switch (animation.dataType) {
                // Float
                case Animation.ANIMATIONTYPE_FLOAT:
                    offsetValue = 0;
                    break;
                // Quaternion
                case Animation.ANIMATIONTYPE_QUATERNION:
                    offsetValue = _staticOffsetValueQuaternion;
                    break;
                // Vector3
                case Animation.ANIMATIONTYPE_VECTOR3:
                    offsetValue = _staticOffsetValueVector3;
                    break;
                // Vector2
                case Animation.ANIMATIONTYPE_VECTOR2:
                    offsetValue = _staticOffsetValueVector2;
                    break;
                // Size
                case Animation.ANIMATIONTYPE_SIZE:
                    offsetValue = _staticOffsetValueSize;
                    break;
                // Color3
                case Animation.ANIMATIONTYPE_COLOR3:
                    offsetValue = _staticOffsetValueColor3;
            }
        }
        // Compute value
        var currentFrame;
        if (this._host && this._host.syncRoot) {
            var syncRoot = this._host.syncRoot;
            var hostNormalizedFrame = (syncRoot.masterFrame - syncRoot.fromFrame) / (syncRoot.toFrame - syncRoot.fromFrame);
            currentFrame = from + (to - from) * hostNormalizedFrame;
        }
        else {
            currentFrame = (returnValue && range !== 0) ? from + ratio % range : to;
        }
        // Reset events if looping
        var events = this._events;
        if (range > 0 && this.currentFrame > currentFrame ||
            range < 0 && this.currentFrame < currentFrame) {
            this._onLoop();
            // Need to reset animation events
            if (events.length) {
                for (var index = 0; index < events.length; index++) {
                    if (!events[index].onlyOnce) {
                        // reset event, the animation is looping
                        events[index].isDone = false;
                    }
                }
            }
        }
        this._currentFrame = currentFrame;
        this._animationState.repeatCount = range === 0 ? 0 : (ratio / range) >> 0;
        this._animationState.highLimitValue = highLimitValue;
        this._animationState.offsetValue = offsetValue;
        var currentValue = animation._interpolate(currentFrame, this._animationState);
        // Set value
        this.setValue(currentValue, weight);
        // Check events
        if (events.length) {
            for (var index = 0; index < events.length; index++) {
                // Make sure current frame has passed event frame and that event frame is within the current range
                // Also, handle both forward and reverse animations
                if ((range > 0 && currentFrame >= events[index].frame && events[index].frame >= from) ||
                    (range < 0 && currentFrame <= events[index].frame && events[index].frame <= from)) {
                    var event = events[index];
                    if (!event.isDone) {
                        // If event should be done only once, remove it.
                        if (event.onlyOnce) {
                            events.splice(index, 1);
                            index--;
                        }
                        event.isDone = true;
                        event.action(currentFrame);
                    } // Don't do anything if the event has already be done.
                }
            }
        }
        if (!returnValue) {
            this._stopped = true;
        }
        return returnValue;
    };
    return RuntimeAnimation;
}());

/**
 * Class used to store bone information
 * @see http://doc.babylonjs.com/how_to/how_to_use_bones_and_skeletons
 */
var Bone = /** @class */ (function (_super) {
    __extends(Bone, _super);
    /**
     * Create a new bone
     * @param name defines the bone name
     * @param skeleton defines the parent skeleton
     * @param parentBone defines the parent (can be null if the bone is the root)
     * @param localMatrix defines the local matrix
     * @param restPose defines the rest pose matrix
     * @param baseMatrix defines the base matrix
     * @param index defines index of the bone in the hiearchy
     */
    function Bone(
    /**
     * defines the bone name
     */
    name, skeleton, parentBone, localMatrix, restPose, baseMatrix, index) {
        if (parentBone === void 0) { parentBone = null; }
        if (localMatrix === void 0) { localMatrix = null; }
        if (restPose === void 0) { restPose = null; }
        if (baseMatrix === void 0) { baseMatrix = null; }
        if (index === void 0) { index = null; }
        var _this = _super.call(this, name, skeleton.getScene(), false) || this;
        _this.name = name;
        /**
         * Gets the list of child bones
         */
        _this.children = new Array();
        /** Gets the animations associated with this bone */
        _this.animations = new Array();
        /**
         * @hidden Internal only
         * Set this value to map this bone to a different index in the transform matrices
         * Set this value to -1 to exclude the bone from the transform matrices
         */
        _this._index = null;
        _this._absoluteTransform = new Matrix();
        _this._invertedAbsoluteTransform = new Matrix();
        _this._scalingDeterminant = 1;
        _this._worldTransform = new Matrix();
        _this._needToDecompose = true;
        _this._needToCompose = false;
        /** @hidden */
        _this._linkedTransformNode = null;
        /** @hidden */
        _this._waitingTransformNodeId = null;
        _this._skeleton = skeleton;
        _this._localMatrix = localMatrix ? localMatrix.clone() : Matrix.Identity();
        _this._restPose = restPose ? restPose : _this._localMatrix.clone();
        _this._baseMatrix = baseMatrix ? baseMatrix : _this._localMatrix.clone();
        _this._index = index;
        skeleton.bones.push(_this);
        _this.setParent(parentBone, false);
        if (baseMatrix || localMatrix) {
            _this._updateDifferenceMatrix();
        }
        return _this;
    }
    Object.defineProperty(Bone.prototype, "_matrix", {
        /** @hidden */
        get: function () {
            this._compose();
            return this._localMatrix;
        },
        /** @hidden */
        set: function (value) {
            this._localMatrix.copyFrom(value);
            this._needToDecompose = true;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the current object class name.
     * @return the class name
     */
    Bone.prototype.getClassName = function () {
        return "Bone";
    };
    // Members
    /**
     * Gets the parent skeleton
     * @returns a skeleton
     */
    Bone.prototype.getSkeleton = function () {
        return this._skeleton;
    };
    /**
     * Gets parent bone
     * @returns a bone or null if the bone is the root of the bone hierarchy
     */
    Bone.prototype.getParent = function () {
        return this._parent;
    };
    /**
     * Returns an array containing the root bones
     * @returns an array containing the root bones
     */
    Bone.prototype.getChildren = function () {
        return this.children;
    };
    /**
     * Sets the parent bone
     * @param parent defines the parent (can be null if the bone is the root)
     * @param updateDifferenceMatrix defines if the difference matrix must be updated
     */
    Bone.prototype.setParent = function (parent, updateDifferenceMatrix) {
        if (updateDifferenceMatrix === void 0) { updateDifferenceMatrix = true; }
        if (this._parent === parent) {
            return;
        }
        if (this._parent) {
            var index = this._parent.children.indexOf(this);
            if (index !== -1) {
                this._parent.children.splice(index, 1);
            }
        }
        this._parent = parent;
        if (this._parent) {
            this._parent.children.push(this);
        }
        if (updateDifferenceMatrix) {
            this._updateDifferenceMatrix();
        }
        this.markAsDirty();
    };
    /**
     * Gets the local matrix
     * @returns a matrix
     */
    Bone.prototype.getLocalMatrix = function () {
        this._compose();
        return this._localMatrix;
    };
    /**
     * Gets the base matrix (initial matrix which remains unchanged)
     * @returns a matrix
     */
    Bone.prototype.getBaseMatrix = function () {
        return this._baseMatrix;
    };
    /**
     * Gets the rest pose matrix
     * @returns a matrix
     */
    Bone.prototype.getRestPose = function () {
        return this._restPose;
    };
    /**
     * Gets a matrix used to store world matrix (ie. the matrix sent to shaders)
     */
    Bone.prototype.getWorldMatrix = function () {
        return this._worldTransform;
    };
    /**
     * Sets the local matrix to rest pose matrix
     */
    Bone.prototype.returnToRest = function () {
        this.updateMatrix(this._restPose.clone());
    };
    /**
     * Gets the inverse of the absolute transform matrix.
     * This matrix will be multiplied by local matrix to get the difference matrix (ie. the difference between original state and current state)
     * @returns a matrix
     */
    Bone.prototype.getInvertedAbsoluteTransform = function () {
        return this._invertedAbsoluteTransform;
    };
    /**
     * Gets the absolute transform matrix (ie base matrix * parent world matrix)
     * @returns a matrix
     */
    Bone.prototype.getAbsoluteTransform = function () {
        return this._absoluteTransform;
    };
    /**
     * Links with the given transform node.
     * The local matrix of this bone is copied from the transform node every frame.
     * @param transformNode defines the transform node to link to
     */
    Bone.prototype.linkTransformNode = function (transformNode) {
        if (this._linkedTransformNode) {
            this._skeleton._numBonesWithLinkedTransformNode--;
        }
        this._linkedTransformNode = transformNode;
        if (this._linkedTransformNode) {
            this._skeleton._numBonesWithLinkedTransformNode++;
        }
    };
    Object.defineProperty(Bone.prototype, "position", {
        // Properties (matches AbstractMesh properties)
        /** Gets or sets current position (in local space) */
        get: function () {
            this._decompose();
            return this._localPosition;
        },
        set: function (newPosition) {
            this._decompose();
            this._localPosition.copyFrom(newPosition);
            this._markAsDirtyAndCompose();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "rotation", {
        /** Gets or sets current rotation (in local space) */
        get: function () {
            return this.getRotation();
        },
        set: function (newRotation) {
            this.setRotation(newRotation);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "rotationQuaternion", {
        /** Gets or sets current rotation quaternion (in local space) */
        get: function () {
            this._decompose();
            return this._localRotation;
        },
        set: function (newRotation) {
            this.setRotationQuaternion(newRotation);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "scaling", {
        /** Gets or sets current scaling (in local space) */
        get: function () {
            return this.getScale();
        },
        set: function (newScaling) {
            this.setScale(newScaling);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bone.prototype, "animationPropertiesOverride", {
        /**
         * Gets the animation properties override
         */
        get: function () {
            return this._skeleton.animationPropertiesOverride;
        },
        enumerable: true,
        configurable: true
    });
    // Methods
    Bone.prototype._decompose = function () {
        if (!this._needToDecompose) {
            return;
        }
        this._needToDecompose = false;
        if (!this._localScaling) {
            this._localScaling = Vector3.Zero();
            this._localRotation = Quaternion.Zero();
            this._localPosition = Vector3.Zero();
        }
        this._localMatrix.decompose(this._localScaling, this._localRotation, this._localPosition);
    };
    Bone.prototype._compose = function () {
        if (!this._needToCompose) {
            return;
        }
        this._needToCompose = false;
        Matrix.ComposeToRef(this._localScaling, this._localRotation, this._localPosition, this._localMatrix);
    };
    /**
     * Update the base and local matrices
     * @param matrix defines the new base or local matrix
     * @param updateDifferenceMatrix defines if the difference matrix must be updated
     * @param updateLocalMatrix defines if the local matrix should be updated
     */
    Bone.prototype.updateMatrix = function (matrix, updateDifferenceMatrix, updateLocalMatrix) {
        if (updateDifferenceMatrix === void 0) { updateDifferenceMatrix = true; }
        if (updateLocalMatrix === void 0) { updateLocalMatrix = true; }
        this._baseMatrix.copyFrom(matrix);
        if (updateDifferenceMatrix) {
            this._updateDifferenceMatrix();
        }
        if (updateLocalMatrix) {
            this._localMatrix.copyFrom(matrix);
            this._markAsDirtyAndDecompose();
        }
        else {
            this.markAsDirty();
        }
    };
    /** @hidden */
    Bone.prototype._updateDifferenceMatrix = function (rootMatrix, updateChildren) {
        if (updateChildren === void 0) { updateChildren = true; }
        if (!rootMatrix) {
            rootMatrix = this._baseMatrix;
        }
        if (this._parent) {
            rootMatrix.multiplyToRef(this._parent._absoluteTransform, this._absoluteTransform);
        }
        else {
            this._absoluteTransform.copyFrom(rootMatrix);
        }
        this._absoluteTransform.invertToRef(this._invertedAbsoluteTransform);
        if (updateChildren) {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index]._updateDifferenceMatrix();
            }
        }
        this._scalingDeterminant = (this._absoluteTransform.determinant() < 0 ? -1 : 1);
    };
    /**
     * Flag the bone as dirty (Forcing it to update everything)
     */
    Bone.prototype.markAsDirty = function () {
        this._currentRenderId++;
        this._childUpdateId++;
        this._skeleton._markAsDirty();
    };
    Bone.prototype._markAsDirtyAndCompose = function () {
        this.markAsDirty();
        this._needToCompose = true;
    };
    Bone.prototype._markAsDirtyAndDecompose = function () {
        this.markAsDirty();
        this._needToDecompose = true;
    };
    /**
     * Translate the bone in local or world space
     * @param vec The amount to translate the bone
     * @param space The space that the translation is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     */
    Bone.prototype.translate = function (vec, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        var lm = this.getLocalMatrix();
        if (space == Space.LOCAL) {
            lm.addAtIndex(12, vec.x);
            lm.addAtIndex(13, vec.y);
            lm.addAtIndex(14, vec.z);
        }
        else {
            var wm = null;
            //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (mesh) {
                wm = mesh.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._tmpMats[0];
            var tvec = Bone._tmpVecs[0];
            if (this._parent) {
                if (mesh && wm) {
                    tmat.copyFrom(this._parent.getAbsoluteTransform());
                    tmat.multiplyToRef(wm, tmat);
                }
                else {
                    tmat.copyFrom(this._parent.getAbsoluteTransform());
                }
            }
            tmat.setTranslationFromFloats(0, 0, 0);
            tmat.invert();
            Vector3.TransformCoordinatesToRef(vec, tmat, tvec);
            lm.addAtIndex(12, tvec.x);
            lm.addAtIndex(13, tvec.y);
            lm.addAtIndex(14, tvec.z);
        }
        this._markAsDirtyAndDecompose();
    };
    /**
     * Set the postion of the bone in local or world space
     * @param position The position to set the bone
     * @param space The space that the position is in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setPosition = function (position, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        var lm = this.getLocalMatrix();
        if (space == Space.LOCAL) {
            lm.setTranslationFromFloats(position.x, position.y, position.z);
        }
        else {
            var wm = null;
            //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (mesh) {
                wm = mesh.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._tmpMats[0];
            var vec = Bone._tmpVecs[0];
            if (this._parent) {
                if (mesh && wm) {
                    tmat.copyFrom(this._parent.getAbsoluteTransform());
                    tmat.multiplyToRef(wm, tmat);
                }
                else {
                    tmat.copyFrom(this._parent.getAbsoluteTransform());
                }
            }
            tmat.invert();
            Vector3.TransformCoordinatesToRef(position, tmat, vec);
            lm.setTranslationFromFloats(vec.x, vec.y, vec.z);
        }
        this._markAsDirtyAndDecompose();
    };
    /**
     * Set the absolute position of the bone (world space)
     * @param position The position to set the bone
     * @param mesh The mesh that this bone is attached to
     */
    Bone.prototype.setAbsolutePosition = function (position, mesh) {
        this.setPosition(position, Space.WORLD, mesh);
    };
    /**
     * Scale the bone on the x, y and z axes (in local space)
     * @param x The amount to scale the bone on the x axis
     * @param y The amount to scale the bone on the y axis
     * @param z The amount to scale the bone on the z axis
     * @param scaleChildren sets this to true if children of the bone should be scaled as well (false by default)
     */
    Bone.prototype.scale = function (x, y, z, scaleChildren) {
        if (scaleChildren === void 0) { scaleChildren = false; }
        var locMat = this.getLocalMatrix();
        // Apply new scaling on top of current local matrix
        var scaleMat = Bone._tmpMats[0];
        Matrix.ScalingToRef(x, y, z, scaleMat);
        scaleMat.multiplyToRef(locMat, locMat);
        // Invert scaling matrix and apply the inverse to all children
        scaleMat.invert();
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var cm = child.getLocalMatrix();
            cm.multiplyToRef(scaleMat, cm);
            cm.multiplyAtIndex(12, x);
            cm.multiplyAtIndex(13, y);
            cm.multiplyAtIndex(14, z);
            child._markAsDirtyAndDecompose();
        }
        this._markAsDirtyAndDecompose();
        if (scaleChildren) {
            for (var _b = 0, _c = this.children; _b < _c.length; _b++) {
                var child = _c[_b];
                child.scale(x, y, z, scaleChildren);
            }
        }
    };
    /**
     * Set the bone scaling in local space
     * @param scale defines the scaling vector
     */
    Bone.prototype.setScale = function (scale) {
        this._decompose();
        this._localScaling.copyFrom(scale);
        this._markAsDirtyAndCompose();
    };
    /**
     * Gets the current scaling in local space
     * @returns the current scaling vector
     */
    Bone.prototype.getScale = function () {
        this._decompose();
        return this._localScaling;
    };
    /**
     * Gets the current scaling in local space and stores it in a target vector
     * @param result defines the target vector
     */
    Bone.prototype.getScaleToRef = function (result) {
        this._decompose();
        result.copyFrom(this._localScaling);
    };
    /**
     * Set the yaw, pitch, and roll of the bone in local or world space
     * @param yaw The rotation of the bone on the y axis
     * @param pitch The rotation of the bone on the x axis
     * @param roll The rotation of the bone on the z axis
     * @param space The space that the axes of rotation are in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setYawPitchRoll = function (yaw, pitch, roll, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._tmpQuat;
            Quaternion.RotationYawPitchRollToRef(yaw, pitch, roll, quat);
            this.setRotationQuaternion(quat, space, mesh);
            return;
        }
        var rotMatInv = Bone._tmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, mesh)) {
            return;
        }
        var rotMat = Bone._tmpMats[1];
        Matrix.RotationYawPitchRollToRef(yaw, pitch, roll, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, mesh);
    };
    /**
     * Add a rotation to the bone on an axis in local or world space
     * @param axis The axis to rotate the bone on
     * @param amount The amount to rotate the bone
     * @param space The space that the axis is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     */
    Bone.prototype.rotate = function (axis, amount, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        var rmat = Bone._tmpMats[0];
        rmat.setTranslationFromFloats(0, 0, 0);
        Matrix.RotationAxisToRef(axis, amount, rmat);
        this._rotateWithMatrix(rmat, space, mesh);
    };
    /**
     * Set the rotation of the bone to a particular axis angle in local or world space
     * @param axis The axis to rotate the bone on
     * @param angle The angle that the bone should be rotated to
     * @param space The space that the axis is in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     */
    Bone.prototype.setAxisAngle = function (axis, angle, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._tmpQuat;
            Quaternion.RotationAxisToRef(axis, angle, quat);
            this.setRotationQuaternion(quat, space, mesh);
            return;
        }
        var rotMatInv = Bone._tmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, mesh)) {
            return;
        }
        var rotMat = Bone._tmpMats[1];
        Matrix.RotationAxisToRef(axis, angle, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, mesh);
    };
    /**
     * Set the euler rotation of the bone in local of world space
     * @param rotation The euler rotation that the bone should be set to
     * @param space The space that the rotation is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotation = function (rotation, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        this.setYawPitchRoll(rotation.y, rotation.x, rotation.z, space, mesh);
    };
    /**
     * Set the quaternion rotation of the bone in local of world space
     * @param quat The quaternion rotation that the bone should be set to
     * @param space The space that the rotation is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotationQuaternion = function (quat, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            this._decompose();
            this._localRotation.copyFrom(quat);
            this._markAsDirtyAndCompose();
            return;
        }
        var rotMatInv = Bone._tmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, mesh)) {
            return;
        }
        var rotMat = Bone._tmpMats[1];
        Matrix.FromQuaternionToRef(quat, rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat);
        this._rotateWithMatrix(rotMat, space, mesh);
    };
    /**
     * Set the rotation matrix of the bone in local of world space
     * @param rotMat The rotation matrix that the bone should be set to
     * @param space The space that the rotation is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     */
    Bone.prototype.setRotationMatrix = function (rotMat, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space === Space.LOCAL) {
            var quat = Bone._tmpQuat;
            Quaternion.FromRotationMatrixToRef(rotMat, quat);
            this.setRotationQuaternion(quat, space, mesh);
            return;
        }
        var rotMatInv = Bone._tmpMats[0];
        if (!this._getNegativeRotationToRef(rotMatInv, mesh)) {
            return;
        }
        var rotMat2 = Bone._tmpMats[1];
        rotMat2.copyFrom(rotMat);
        rotMatInv.multiplyToRef(rotMat, rotMat2);
        this._rotateWithMatrix(rotMat2, space, mesh);
    };
    Bone.prototype._rotateWithMatrix = function (rmat, space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        var lmat = this.getLocalMatrix();
        var lx = lmat.m[12];
        var ly = lmat.m[13];
        var lz = lmat.m[14];
        var parent = this.getParent();
        var parentScale = Bone._tmpMats[3];
        var parentScaleInv = Bone._tmpMats[4];
        if (parent && space == Space.WORLD) {
            if (mesh) {
                parentScale.copyFrom(mesh.getWorldMatrix());
                parent.getAbsoluteTransform().multiplyToRef(parentScale, parentScale);
            }
            else {
                parentScale.copyFrom(parent.getAbsoluteTransform());
            }
            parentScaleInv.copyFrom(parentScale);
            parentScaleInv.invert();
            lmat.multiplyToRef(parentScale, lmat);
            lmat.multiplyToRef(rmat, lmat);
            lmat.multiplyToRef(parentScaleInv, lmat);
        }
        else {
            if (space == Space.WORLD && mesh) {
                parentScale.copyFrom(mesh.getWorldMatrix());
                parentScaleInv.copyFrom(parentScale);
                parentScaleInv.invert();
                lmat.multiplyToRef(parentScale, lmat);
                lmat.multiplyToRef(rmat, lmat);
                lmat.multiplyToRef(parentScaleInv, lmat);
            }
            else {
                lmat.multiplyToRef(rmat, lmat);
            }
        }
        lmat.setTranslationFromFloats(lx, ly, lz);
        this.computeAbsoluteTransforms();
        this._markAsDirtyAndDecompose();
    };
    Bone.prototype._getNegativeRotationToRef = function (rotMatInv, mesh) {
        var scaleMatrix = Bone._tmpMats[2];
        rotMatInv.copyFrom(this.getAbsoluteTransform());
        if (mesh) {
            rotMatInv.multiplyToRef(mesh.getWorldMatrix(), rotMatInv);
            Matrix.ScalingToRef(mesh.scaling.x, mesh.scaling.y, mesh.scaling.z, scaleMatrix);
        }
        rotMatInv.invert();
        if (isNaN(rotMatInv.m[0])) {
            // Matrix failed to invert.
            // This can happen if scale is zero for example.
            return false;
        }
        scaleMatrix.multiplyAtIndex(0, this._scalingDeterminant);
        rotMatInv.multiplyToRef(scaleMatrix, rotMatInv);
        return true;
    };
    /**
     * Get the position of the bone in local or world space
     * @param space The space that the returned position is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     * @returns The position of the bone
     */
    Bone.prototype.getPosition = function (space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (mesh === void 0) { mesh = null; }
        var pos = Vector3.Zero();
        this.getPositionToRef(space, mesh, pos);
        return pos;
    };
    /**
     * Copy the position of the bone to a vector3 in local or world space
     * @param space The space that the returned position is in
     * @param mesh The mesh that this bone is attached to. This is only used in world space
     * @param result The vector3 to copy the position to
     */
    Bone.prototype.getPositionToRef = function (space, mesh, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space == Space.LOCAL) {
            var lm = this.getLocalMatrix();
            result.x = lm.m[12];
            result.y = lm.m[13];
            result.z = lm.m[14];
        }
        else {
            var wm = null;
            //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
            if (mesh) {
                wm = mesh.getWorldMatrix();
            }
            this._skeleton.computeAbsoluteTransforms();
            var tmat = Bone._tmpMats[0];
            if (mesh && wm) {
                tmat.copyFrom(this.getAbsoluteTransform());
                tmat.multiplyToRef(wm, tmat);
            }
            else {
                tmat = this.getAbsoluteTransform();
            }
            result.x = tmat.m[12];
            result.y = tmat.m[13];
            result.z = tmat.m[14];
        }
    };
    /**
     * Get the absolute position of the bone (world space)
     * @param mesh The mesh that this bone is attached to
     * @returns The absolute position of the bone
     */
    Bone.prototype.getAbsolutePosition = function (mesh) {
        if (mesh === void 0) { mesh = null; }
        var pos = Vector3.Zero();
        this.getPositionToRef(Space.WORLD, mesh, pos);
        return pos;
    };
    /**
     * Copy the absolute position of the bone (world space) to the result param
     * @param mesh The mesh that this bone is attached to
     * @param result The vector3 to copy the absolute position to
     */
    Bone.prototype.getAbsolutePositionToRef = function (mesh, result) {
        this.getPositionToRef(Space.WORLD, mesh, result);
    };
    /**
     * Compute the absolute transforms of this bone and its children
     */
    Bone.prototype.computeAbsoluteTransforms = function () {
        this._compose();
        if (this._parent) {
            this._localMatrix.multiplyToRef(this._parent._absoluteTransform, this._absoluteTransform);
        }
        else {
            this._absoluteTransform.copyFrom(this._localMatrix);
            var poseMatrix = this._skeleton.getPoseMatrix();
            if (poseMatrix) {
                this._absoluteTransform.multiplyToRef(poseMatrix, this._absoluteTransform);
            }
        }
        var children = this.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
            children[i].computeAbsoluteTransforms();
        }
    };
    /**
     * Get the world direction from an axis that is in the local space of the bone
     * @param localAxis The local direction that is used to compute the world direction
     * @param mesh The mesh that this bone is attached to
     * @returns The world direction
     */
    Bone.prototype.getDirection = function (localAxis, mesh) {
        if (mesh === void 0) { mesh = null; }
        var result = Vector3.Zero();
        this.getDirectionToRef(localAxis, mesh, result);
        return result;
    };
    /**
     * Copy the world direction to a vector3 from an axis that is in the local space of the bone
     * @param localAxis The local direction that is used to compute the world direction
     * @param mesh The mesh that this bone is attached to
     * @param result The vector3 that the world direction will be copied to
     */
    Bone.prototype.getDirectionToRef = function (localAxis, mesh, result) {
        if (mesh === void 0) { mesh = null; }
        var wm = null;
        //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (mesh) {
            wm = mesh.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var mat = Bone._tmpMats[0];
        mat.copyFrom(this.getAbsoluteTransform());
        if (mesh && wm) {
            mat.multiplyToRef(wm, mat);
        }
        Vector3.TransformNormalToRef(localAxis, mat, result);
        result.normalize();
    };
    /**
     * Get the euler rotation of the bone in local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @returns The euler rotation
     */
    Bone.prototype.getRotation = function (space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (mesh === void 0) { mesh = null; }
        var result = Vector3.Zero();
        this.getRotationToRef(space, mesh, result);
        return result;
    };
    /**
     * Copy the euler rotation of the bone to a vector3.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @param result The vector3 that the rotation should be copied to
     */
    Bone.prototype.getRotationToRef = function (space, mesh, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (mesh === void 0) { mesh = null; }
        var quat = Bone._tmpQuat;
        this.getRotationQuaternionToRef(space, mesh, quat);
        quat.toEulerAnglesToRef(result);
    };
    /**
     * Get the quaternion rotation of the bone in either local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @returns The quaternion rotation
     */
    Bone.prototype.getRotationQuaternion = function (space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        if (mesh === void 0) { mesh = null; }
        var result = Quaternion.Identity();
        this.getRotationQuaternionToRef(space, mesh, result);
        return result;
    };
    /**
     * Copy the quaternion rotation of the bone to a quaternion.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @param result The quaternion that the rotation should be copied to
     */
    Bone.prototype.getRotationQuaternionToRef = function (space, mesh, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (mesh === void 0) { mesh = null; }
        if (space == Space.LOCAL) {
            this._decompose();
            result.copyFrom(this._localRotation);
        }
        else {
            var mat = Bone._tmpMats[0];
            var amat = this.getAbsoluteTransform();
            if (mesh) {
                amat.multiplyToRef(mesh.getWorldMatrix(), mat);
            }
            else {
                mat.copyFrom(amat);
            }
            mat.multiplyAtIndex(0, this._scalingDeterminant);
            mat.multiplyAtIndex(1, this._scalingDeterminant);
            mat.multiplyAtIndex(2, this._scalingDeterminant);
            mat.decompose(undefined, result, undefined);
        }
    };
    /**
     * Get the rotation matrix of the bone in local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @returns The rotation matrix
     */
    Bone.prototype.getRotationMatrix = function (space, mesh) {
        if (space === void 0) { space = Space.LOCAL; }
        var result = Matrix.Identity();
        this.getRotationMatrixToRef(space, mesh, result);
        return result;
    };
    /**
     * Copy the rotation matrix of the bone to a matrix.  The rotation can be in either local or world space
     * @param space The space that the rotation should be in
     * @param mesh The mesh that this bone is attached to.  This is only used in world space
     * @param result The quaternion that the rotation should be copied to
     */
    Bone.prototype.getRotationMatrixToRef = function (space, mesh, result) {
        if (space === void 0) { space = Space.LOCAL; }
        if (space == Space.LOCAL) {
            this.getLocalMatrix().getRotationMatrixToRef(result);
        }
        else {
            var mat = Bone._tmpMats[0];
            var amat = this.getAbsoluteTransform();
            if (mesh) {
                amat.multiplyToRef(mesh.getWorldMatrix(), mat);
            }
            else {
                mat.copyFrom(amat);
            }
            mat.multiplyAtIndex(0, this._scalingDeterminant);
            mat.multiplyAtIndex(1, this._scalingDeterminant);
            mat.multiplyAtIndex(2, this._scalingDeterminant);
            mat.getRotationMatrixToRef(result);
        }
    };
    /**
     * Get the world position of a point that is in the local space of the bone
     * @param position The local position
     * @param mesh The mesh that this bone is attached to
     * @returns The world position
     */
    Bone.prototype.getAbsolutePositionFromLocal = function (position, mesh) {
        if (mesh === void 0) { mesh = null; }
        var result = Vector3.Zero();
        this.getAbsolutePositionFromLocalToRef(position, mesh, result);
        return result;
    };
    /**
     * Get the world position of a point that is in the local space of the bone and copy it to the result param
     * @param position The local position
     * @param mesh The mesh that this bone is attached to
     * @param result The vector3 that the world position should be copied to
     */
    Bone.prototype.getAbsolutePositionFromLocalToRef = function (position, mesh, result) {
        if (mesh === void 0) { mesh = null; }
        var wm = null;
        //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (mesh) {
            wm = mesh.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var tmat = Bone._tmpMats[0];
        if (mesh && wm) {
            tmat.copyFrom(this.getAbsoluteTransform());
            tmat.multiplyToRef(wm, tmat);
        }
        else {
            tmat = this.getAbsoluteTransform();
        }
        Vector3.TransformCoordinatesToRef(position, tmat, result);
    };
    /**
     * Get the local position of a point that is in world space
     * @param position The world position
     * @param mesh The mesh that this bone is attached to
     * @returns The local position
     */
    Bone.prototype.getLocalPositionFromAbsolute = function (position, mesh) {
        if (mesh === void 0) { mesh = null; }
        var result = Vector3.Zero();
        this.getLocalPositionFromAbsoluteToRef(position, mesh, result);
        return result;
    };
    /**
     * Get the local position of a point that is in world space and copy it to the result param
     * @param position The world position
     * @param mesh The mesh that this bone is attached to
     * @param result The vector3 that the local position should be copied to
     */
    Bone.prototype.getLocalPositionFromAbsoluteToRef = function (position, mesh, result) {
        if (mesh === void 0) { mesh = null; }
        var wm = null;
        //mesh.getWorldMatrix() needs to be called before skeleton.computeAbsoluteTransforms()
        if (mesh) {
            wm = mesh.getWorldMatrix();
        }
        this._skeleton.computeAbsoluteTransforms();
        var tmat = Bone._tmpMats[0];
        tmat.copyFrom(this.getAbsoluteTransform());
        if (mesh && wm) {
            tmat.multiplyToRef(wm, tmat);
        }
        tmat.invert();
        Vector3.TransformCoordinatesToRef(position, tmat, result);
    };
    Bone._tmpVecs = ArrayTools.BuildArray(2, Vector3.Zero);
    Bone._tmpQuat = Quaternion.Identity();
    Bone._tmpMats = ArrayTools.BuildArray(5, Matrix.Identity);
    return Bone;
}(Node));

/**
 * Class used to store an actual running animation
 */
var Animatable = /** @class */ (function () {
    /**
     * Creates a new Animatable
     * @param scene defines the hosting scene
     * @param target defines the target object
     * @param fromFrame defines the starting frame number (default is 0)
     * @param toFrame defines the ending frame number (default is 100)
     * @param loopAnimation defines if the animation must loop (default is false)
     * @param speedRatio defines the factor to apply to animation speed (default is 1)
     * @param onAnimationEnd defines a callback to call when animation ends if it is not looping
     * @param animations defines a group of animation to add to the new Animatable
     * @param onAnimationLoop defines a callback to call when animation loops
     */
    function Animatable(scene, 
    /** defines the target object */
    target, 
    /** defines the starting frame number (default is 0) */
    fromFrame, 
    /** defines the ending frame number (default is 100) */
    toFrame, 
    /** defines if the animation must loop (default is false)  */
    loopAnimation, speedRatio, 
    /** defines a callback to call when animation ends if it is not looping */
    onAnimationEnd, animations, 
    /** defines a callback to call when animation loops */
    onAnimationLoop) {
        if (fromFrame === void 0) { fromFrame = 0; }
        if (toFrame === void 0) { toFrame = 100; }
        if (loopAnimation === void 0) { loopAnimation = false; }
        if (speedRatio === void 0) { speedRatio = 1.0; }
        this.target = target;
        this.fromFrame = fromFrame;
        this.toFrame = toFrame;
        this.loopAnimation = loopAnimation;
        this.onAnimationEnd = onAnimationEnd;
        this.onAnimationLoop = onAnimationLoop;
        this._localDelayOffset = null;
        this._pausedDelay = null;
        this._runtimeAnimations = new Array();
        this._paused = false;
        this._speedRatio = 1;
        this._weight = -1.0;
        this._syncRoot = null;
        /**
         * Gets or sets a boolean indicating if the animatable must be disposed and removed at the end of the animation.
         * This will only apply for non looping animation (default is true)
         */
        this.disposeOnEnd = true;
        /**
         * Gets a boolean indicating if the animation has started
         */
        this.animationStarted = false;
        /**
         * Observer raised when the animation ends
         */
        this.onAnimationEndObservable = new Observable();
        /**
         * Observer raised when the animation loops
         */
        this.onAnimationLoopObservable = new Observable();
        this._scene = scene;
        if (animations) {
            this.appendAnimations(target, animations);
        }
        this._speedRatio = speedRatio;
        scene._activeAnimatables.push(this);
    }
    Object.defineProperty(Animatable.prototype, "syncRoot", {
        /**
         * Gets the root Animatable used to synchronize and normalize animations
         */
        get: function () {
            return this._syncRoot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animatable.prototype, "masterFrame", {
        /**
         * Gets the current frame of the first RuntimeAnimation
         * Used to synchronize Animatables
         */
        get: function () {
            if (this._runtimeAnimations.length === 0) {
                return 0;
            }
            return this._runtimeAnimations[0].currentFrame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animatable.prototype, "weight", {
        /**
         * Gets or sets the animatable weight (-1.0 by default meaning not weighted)
         */
        get: function () {
            return this._weight;
        },
        set: function (value) {
            if (value === -1) { // -1 is ok and means no weight
                this._weight = -1;
                return;
            }
            // Else weight must be in [0, 1] range
            this._weight = Math.min(Math.max(value, 0), 1.0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animatable.prototype, "speedRatio", {
        /**
         * Gets or sets the speed ratio to apply to the animatable (1.0 by default)
         */
        get: function () {
            return this._speedRatio;
        },
        set: function (value) {
            for (var index = 0; index < this._runtimeAnimations.length; index++) {
                var animation = this._runtimeAnimations[index];
                animation._prepareForSpeedRatioChange(value);
            }
            this._speedRatio = value;
        },
        enumerable: true,
        configurable: true
    });
    // Methods
    /**
     * Synchronize and normalize current Animatable with a source Animatable
     * This is useful when using animation weights and when animations are not of the same length
     * @param root defines the root Animatable to synchronize with
     * @returns the current Animatable
     */
    Animatable.prototype.syncWith = function (root) {
        this._syncRoot = root;
        if (root) {
            // Make sure this animatable will animate after the root
            var index = this._scene._activeAnimatables.indexOf(this);
            if (index > -1) {
                this._scene._activeAnimatables.splice(index, 1);
                this._scene._activeAnimatables.push(this);
            }
        }
        return this;
    };
    /**
     * Gets the list of runtime animations
     * @returns an array of RuntimeAnimation
     */
    Animatable.prototype.getAnimations = function () {
        return this._runtimeAnimations;
    };
    /**
     * Adds more animations to the current animatable
     * @param target defines the target of the animations
     * @param animations defines the new animations to add
     */
    Animatable.prototype.appendAnimations = function (target, animations) {
        var _this = this;
        for (var index = 0; index < animations.length; index++) {
            var animation = animations[index];
            var newRuntimeAnimation = new RuntimeAnimation(target, animation, this._scene, this);
            newRuntimeAnimation._onLoop = function () {
                _this.onAnimationLoopObservable.notifyObservers(_this);
                if (_this.onAnimationLoop) {
                    _this.onAnimationLoop();
                }
            };
            this._runtimeAnimations.push(newRuntimeAnimation);
        }
    };
    /**
     * Gets the source animation for a specific property
     * @param property defines the propertyu to look for
     * @returns null or the source animation for the given property
     */
    Animatable.prototype.getAnimationByTargetProperty = function (property) {
        var runtimeAnimations = this._runtimeAnimations;
        for (var index = 0; index < runtimeAnimations.length; index++) {
            if (runtimeAnimations[index].animation.targetProperty === property) {
                return runtimeAnimations[index].animation;
            }
        }
        return null;
    };
    /**
     * Gets the runtime animation for a specific property
     * @param property defines the propertyu to look for
     * @returns null or the runtime animation for the given property
     */
    Animatable.prototype.getRuntimeAnimationByTargetProperty = function (property) {
        var runtimeAnimations = this._runtimeAnimations;
        for (var index = 0; index < runtimeAnimations.length; index++) {
            if (runtimeAnimations[index].animation.targetProperty === property) {
                return runtimeAnimations[index];
            }
        }
        return null;
    };
    /**
     * Resets the animatable to its original state
     */
    Animatable.prototype.reset = function () {
        var runtimeAnimations = this._runtimeAnimations;
        for (var index = 0; index < runtimeAnimations.length; index++) {
            runtimeAnimations[index].reset(true);
        }
        this._localDelayOffset = null;
        this._pausedDelay = null;
    };
    /**
     * Allows the animatable to blend with current running animations
     * @see http://doc.babylonjs.com/babylon101/animations#animation-blending
     * @param blendingSpeed defines the blending speed to use
     */
    Animatable.prototype.enableBlending = function (blendingSpeed) {
        var runtimeAnimations = this._runtimeAnimations;
        for (var index = 0; index < runtimeAnimations.length; index++) {
            runtimeAnimations[index].animation.enableBlending = true;
            runtimeAnimations[index].animation.blendingSpeed = blendingSpeed;
        }
    };
    /**
     * Disable animation blending
     * @see http://doc.babylonjs.com/babylon101/animations#animation-blending
     */
    Animatable.prototype.disableBlending = function () {
        var runtimeAnimations = this._runtimeAnimations;
        for (var index = 0; index < runtimeAnimations.length; index++) {
            runtimeAnimations[index].animation.enableBlending = false;
        }
    };
    /**
     * Jump directly to a given frame
     * @param frame defines the frame to jump to
     */
    Animatable.prototype.goToFrame = function (frame) {
        var runtimeAnimations = this._runtimeAnimations;
        if (runtimeAnimations[0]) {
            var fps = runtimeAnimations[0].animation.framePerSecond;
            var currentFrame = runtimeAnimations[0].currentFrame;
            var adjustTime = frame - currentFrame;
            var delay = this.speedRatio !== 0 ? adjustTime * 1000 / (fps * this.speedRatio) : 0;
            if (this._localDelayOffset === null) {
                this._localDelayOffset = 0;
            }
            this._localDelayOffset -= delay;
        }
        for (var index = 0; index < runtimeAnimations.length; index++) {
            runtimeAnimations[index].goToFrame(frame);
        }
    };
    /**
     * Pause the animation
     */
    Animatable.prototype.pause = function () {
        if (this._paused) {
            return;
        }
        this._paused = true;
    };
    /**
     * Restart the animation
     */
    Animatable.prototype.restart = function () {
        this._paused = false;
    };
    Animatable.prototype._raiseOnAnimationEnd = function () {
        if (this.onAnimationEnd) {
            this.onAnimationEnd();
        }
        this.onAnimationEndObservable.notifyObservers(this);
    };
    /**
     * Stop and delete the current animation
     * @param animationName defines a string used to only stop some of the runtime animations instead of all
     * @param targetMask - a function that determines if the animation should be stopped based on its target (all animations will be stopped if both this and animationName are empty)
     */
    Animatable.prototype.stop = function (animationName, targetMask) {
        if (animationName || targetMask) {
            var idx = this._scene._activeAnimatables.indexOf(this);
            if (idx > -1) {
                var runtimeAnimations = this._runtimeAnimations;
                for (var index = runtimeAnimations.length - 1; index >= 0; index--) {
                    var runtimeAnimation = runtimeAnimations[index];
                    if (animationName && runtimeAnimation.animation.name != animationName) {
                        continue;
                    }
                    if (targetMask && !targetMask(runtimeAnimation.target)) {
                        continue;
                    }
                    runtimeAnimation.dispose();
                    runtimeAnimations.splice(index, 1);
                }
                if (runtimeAnimations.length == 0) {
                    this._scene._activeAnimatables.splice(idx, 1);
                    this._raiseOnAnimationEnd();
                }
            }
        }
        else {
            var index = this._scene._activeAnimatables.indexOf(this);
            if (index > -1) {
                this._scene._activeAnimatables.splice(index, 1);
                var runtimeAnimations = this._runtimeAnimations;
                for (var index = 0; index < runtimeAnimations.length; index++) {
                    runtimeAnimations[index].dispose();
                }
                this._raiseOnAnimationEnd();
            }
        }
    };
    /**
     * Wait asynchronously for the animation to end
     * @returns a promise which will be fullfilled when the animation ends
     */
    Animatable.prototype.waitAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.onAnimationEndObservable.add(function () {
                resolve(_this);
            }, undefined, undefined, _this, true);
        });
    };
    /** @hidden */
    Animatable.prototype._animate = function (delay) {
        if (this._paused) {
            this.animationStarted = false;
            if (this._pausedDelay === null) {
                this._pausedDelay = delay;
            }
            return true;
        }
        if (this._localDelayOffset === null) {
            this._localDelayOffset = delay;
            this._pausedDelay = null;
        }
        else if (this._pausedDelay !== null) {
            this._localDelayOffset += delay - this._pausedDelay;
            this._pausedDelay = null;
        }
        if (this._weight === 0) { // We consider that an animation with a weight === 0 is "actively" paused
            return true;
        }
        // Animating
        var running = false;
        var runtimeAnimations = this._runtimeAnimations;
        var index;
        for (index = 0; index < runtimeAnimations.length; index++) {
            var animation = runtimeAnimations[index];
            var isRunning = animation.animate(delay - this._localDelayOffset, this.fromFrame, this.toFrame, this.loopAnimation, this._speedRatio, this._weight);
            running = running || isRunning;
        }
        this.animationStarted = running;
        if (!running) {
            if (this.disposeOnEnd) {
                // Remove from active animatables
                index = this._scene._activeAnimatables.indexOf(this);
                this._scene._activeAnimatables.splice(index, 1);
                // Dispose all runtime animations
                for (index = 0; index < runtimeAnimations.length; index++) {
                    runtimeAnimations[index].dispose();
                }
            }
            this._raiseOnAnimationEnd();
            if (this.disposeOnEnd) {
                this.onAnimationEnd = null;
                this.onAnimationLoop = null;
                this.onAnimationLoopObservable.clear();
                this.onAnimationEndObservable.clear();
            }
        }
        return running;
    };
    return Animatable;
}());
Scene.prototype._animate = function () {
    if (!this.animationsEnabled) {
        return;
    }
    var animatables = this._activeAnimatables;
    if (animatables.length === 0) {
        return;
    }
    // Getting time
    var now = PrecisionDate.Now;
    if (!this._animationTimeLast) {
        if (this._pendingData.length > 0) {
            return;
        }
        this._animationTimeLast = now;
    }
    var deltaTime = this.useConstantAnimationDeltaTime ? 16.0 : (now - this._animationTimeLast) * this.animationTimeScale;
    this._animationTime += deltaTime;
    var animationTime = this._animationTime;
    this._animationTimeLast = now;
    for (var index = 0; index < animatables.length; index++) {
        animatables[index]._animate(animationTime);
    }
    // Late animation bindings
    this._processLateAnimationBindings();
};
Scene.prototype.beginWeightedAnimation = function (target, from, to, weight, loop, speedRatio, onAnimationEnd, animatable, targetMask, onAnimationLoop) {
    if (weight === void 0) { weight = 1.0; }
    if (speedRatio === void 0) { speedRatio = 1.0; }
    var returnedAnimatable = this.beginAnimation(target, from, to, loop, speedRatio, onAnimationEnd, animatable, false, targetMask, onAnimationLoop);
    returnedAnimatable.weight = weight;
    return returnedAnimatable;
};
Scene.prototype.beginAnimation = function (target, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, onAnimationLoop) {
    if (speedRatio === void 0) { speedRatio = 1.0; }
    if (stopCurrent === void 0) { stopCurrent = true; }
    if (from > to && speedRatio > 0) {
        speedRatio *= -1;
    }
    if (stopCurrent) {
        this.stopAnimation(target, undefined, targetMask);
    }
    if (!animatable) {
        animatable = new Animatable(this, target, from, to, loop, speedRatio, onAnimationEnd, undefined, onAnimationLoop);
    }
    var shouldRunTargetAnimations = targetMask ? targetMask(target) : true;
    // Local animations
    if (target.animations && shouldRunTargetAnimations) {
        animatable.appendAnimations(target, target.animations);
    }
    // Children animations
    if (target.getAnimatables) {
        var animatables = target.getAnimatables();
        for (var index = 0; index < animatables.length; index++) {
            this.beginAnimation(animatables[index], from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, onAnimationLoop);
        }
    }
    animatable.reset();
    return animatable;
};
Scene.prototype.beginHierarchyAnimation = function (target, directDescendantsOnly, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, onAnimationLoop) {
    if (speedRatio === void 0) { speedRatio = 1.0; }
    if (stopCurrent === void 0) { stopCurrent = true; }
    var children = target.getDescendants(directDescendantsOnly);
    var result = [];
    result.push(this.beginAnimation(target, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask));
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        result.push(this.beginAnimation(child, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask));
    }
    return result;
};
Scene.prototype.beginDirectAnimation = function (target, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop) {
    if (speedRatio === undefined) {
        speedRatio = 1.0;
    }
    var animatable = new Animatable(this, target, from, to, loop, speedRatio, onAnimationEnd, animations, onAnimationLoop);
    return animatable;
};
Scene.prototype.beginDirectHierarchyAnimation = function (target, directDescendantsOnly, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop) {
    var children = target.getDescendants(directDescendantsOnly);
    var result = [];
    result.push(this.beginDirectAnimation(target, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop));
    for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
        var child = children_2[_i];
        result.push(this.beginDirectAnimation(child, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop));
    }
    return result;
};
Scene.prototype.getAnimatableByTarget = function (target) {
    for (var index = 0; index < this._activeAnimatables.length; index++) {
        if (this._activeAnimatables[index].target === target) {
            return this._activeAnimatables[index];
        }
    }
    return null;
};
Scene.prototype.getAllAnimatablesByTarget = function (target) {
    var result = [];
    for (var index = 0; index < this._activeAnimatables.length; index++) {
        if (this._activeAnimatables[index].target === target) {
            result.push(this._activeAnimatables[index]);
        }
    }
    return result;
};
/**
 * Will stop the animation of the given target
 * @param target - the target
 * @param animationName - the name of the animation to stop (all animations will be stopped if both this and targetMask are empty)
 * @param targetMask - a function that determines if the animation should be stopped based on its target (all animations will be stopped if both this and animationName are empty)
 */
Scene.prototype.stopAnimation = function (target, animationName, targetMask) {
    var animatables = this.getAllAnimatablesByTarget(target);
    for (var _i = 0, animatables_1 = animatables; _i < animatables_1.length; _i++) {
        var animatable = animatables_1[_i];
        animatable.stop(animationName, targetMask);
    }
};
/**
 * Stops and removes all animations that have been applied to the scene
 */
Scene.prototype.stopAllAnimations = function () {
    if (this._activeAnimatables) {
        for (var i = 0; i < this._activeAnimatables.length; i++) {
            this._activeAnimatables[i].stop();
        }
        this._activeAnimatables = [];
    }
    for (var _i = 0, _a = this.animationGroups; _i < _a.length; _i++) {
        var group = _a[_i];
        group.stop();
    }
};
Scene.prototype._registerTargetForLateAnimationBinding = function (runtimeAnimation, originalValue) {
    var target = runtimeAnimation.target;
    this._registeredForLateAnimationBindings.pushNoDuplicate(target);
    if (!target._lateAnimationHolders) {
        target._lateAnimationHolders = {};
    }
    if (!target._lateAnimationHolders[runtimeAnimation.targetPath]) {
        target._lateAnimationHolders[runtimeAnimation.targetPath] = {
            totalWeight: 0,
            animations: [],
            originalValue: originalValue
        };
    }
    target._lateAnimationHolders[runtimeAnimation.targetPath].animations.push(runtimeAnimation);
    target._lateAnimationHolders[runtimeAnimation.targetPath].totalWeight += runtimeAnimation.weight;
};
Scene.prototype._processLateAnimationBindingsForMatrices = function (holder) {
    var normalizer = 1.0;
    var finalPosition = Tmp.Vector3[0];
    var finalScaling = Tmp.Vector3[1];
    var finalQuaternion = Tmp.Quaternion[0];
    var startIndex = 0;
    var originalAnimation = holder.animations[0];
    var originalValue = holder.originalValue;
    var scale = 1;
    if (holder.totalWeight < 1.0) {
        // We need to mix the original value in
        originalValue.decompose(finalScaling, finalQuaternion, finalPosition);
        scale = 1.0 - holder.totalWeight;
    }
    else {
        startIndex = 1;
        // We need to normalize the weights
        normalizer = holder.totalWeight;
        originalAnimation.currentValue.decompose(finalScaling, finalQuaternion, finalPosition);
        scale = originalAnimation.weight / normalizer;
        if (scale == 1) {
            return originalAnimation.currentValue;
        }
    }
    finalScaling.scaleInPlace(scale);
    finalPosition.scaleInPlace(scale);
    finalQuaternion.scaleInPlace(scale);
    for (var animIndex = startIndex; animIndex < holder.animations.length; animIndex++) {
        var runtimeAnimation = holder.animations[animIndex];
        var scale = runtimeAnimation.weight / normalizer;
        var currentPosition = Tmp.Vector3[2];
        var currentScaling = Tmp.Vector3[3];
        var currentQuaternion = Tmp.Quaternion[1];
        runtimeAnimation.currentValue.decompose(currentScaling, currentQuaternion, currentPosition);
        currentScaling.scaleAndAddToRef(scale, finalScaling);
        currentQuaternion.scaleAndAddToRef(scale, finalQuaternion);
        currentPosition.scaleAndAddToRef(scale, finalPosition);
    }
    var workValue = originalAnimation._animationState.workValue;
    Matrix.ComposeToRef(finalScaling, finalQuaternion, finalPosition, workValue);
    return workValue;
};
Scene.prototype._processLateAnimationBindingsForQuaternions = function (holder, refQuaternion) {
    var originalAnimation = holder.animations[0];
    var originalValue = holder.originalValue;
    if (holder.animations.length === 1) {
        Quaternion.SlerpToRef(originalValue, originalAnimation.currentValue, Math.min(1.0, holder.totalWeight), refQuaternion);
        return refQuaternion;
    }
    var normalizer = 1.0;
    var quaternions;
    var weights;
    if (holder.totalWeight < 1.0) {
        var scale = 1.0 - holder.totalWeight;
        quaternions = [];
        weights = [];
        quaternions.push(originalValue);
        weights.push(scale);
    }
    else {
        if (holder.animations.length === 2) { // Slerp as soon as we can
            Quaternion.SlerpToRef(holder.animations[0].currentValue, holder.animations[1].currentValue, holder.animations[1].weight / holder.totalWeight, refQuaternion);
            return refQuaternion;
        }
        quaternions = [];
        weights = [];
        normalizer = holder.totalWeight;
    }
    for (var animIndex = 0; animIndex < holder.animations.length; animIndex++) {
        var runtimeAnimation = holder.animations[animIndex];
        quaternions.push(runtimeAnimation.currentValue);
        weights.push(runtimeAnimation.weight / normalizer);
    }
    // https://gamedev.stackexchange.com/questions/62354/method-for-interpolation-between-3-quaternions
    var cumulativeAmount = 0;
    var cumulativeQuaternion = null;
    for (var index = 0; index < quaternions.length;) {
        if (!cumulativeQuaternion) {
            Quaternion.SlerpToRef(quaternions[index], quaternions[index + 1], weights[index + 1] / (weights[index] + weights[index + 1]), refQuaternion);
            cumulativeQuaternion = refQuaternion;
            cumulativeAmount = weights[index] + weights[index + 1];
            index += 2;
            continue;
        }
        cumulativeAmount += weights[index];
        Quaternion.SlerpToRef(cumulativeQuaternion, quaternions[index], weights[index] / cumulativeAmount, cumulativeQuaternion);
        index++;
    }
    return cumulativeQuaternion;
};
Scene.prototype._processLateAnimationBindings = function () {
    if (!this._registeredForLateAnimationBindings.length) {
        return;
    }
    for (var index = 0; index < this._registeredForLateAnimationBindings.length; index++) {
        var target = this._registeredForLateAnimationBindings.data[index];
        for (var path in target._lateAnimationHolders) {
            var holder = target._lateAnimationHolders[path];
            var originalAnimation = holder.animations[0];
            var originalValue = holder.originalValue;
            var matrixDecomposeMode = Animation.AllowMatrixDecomposeForInterpolation && originalValue.m; // ie. data is matrix
            var finalValue = target[path];
            if (matrixDecomposeMode) {
                finalValue = this._processLateAnimationBindingsForMatrices(holder);
            }
            else {
                var quaternionMode = originalValue.w !== undefined;
                if (quaternionMode) {
                    finalValue = this._processLateAnimationBindingsForQuaternions(holder, finalValue || Quaternion.Identity());
                }
                else {
                    var startIndex = 0;
                    var normalizer = 1.0;
                    if (holder.totalWeight < 1.0) {
                        // We need to mix the original value in
                        if (originalValue.scale) {
                            finalValue = originalValue.scale(1.0 - holder.totalWeight);
                        }
                        else {
                            finalValue = originalValue * (1.0 - holder.totalWeight);
                        }
                    }
                    else {
                        // We need to normalize the weights
                        normalizer = holder.totalWeight;
                        var scale_1 = originalAnimation.weight / normalizer;
                        if (scale_1 !== 1) {
                            if (originalAnimation.currentValue.scale) {
                                finalValue = originalAnimation.currentValue.scale(scale_1);
                            }
                            else {
                                finalValue = originalAnimation.currentValue * scale_1;
                            }
                        }
                        else {
                            finalValue = originalAnimation.currentValue;
                        }
                        startIndex = 1;
                    }
                    for (var animIndex = startIndex; animIndex < holder.animations.length; animIndex++) {
                        var runtimeAnimation = holder.animations[animIndex];
                        var scale = runtimeAnimation.weight / normalizer;
                        if (runtimeAnimation.currentValue.scaleAndAddToRef) {
                            runtimeAnimation.currentValue.scaleAndAddToRef(scale, finalValue);
                        }
                        else {
                            finalValue += runtimeAnimation.currentValue * scale;
                        }
                    }
                }
            }
            target[path] = finalValue;
        }
        target._lateAnimationHolders = {};
    }
    this._registeredForLateAnimationBindings.reset();
};
Bone.prototype.copyAnimationRange = function (source, rangeName, frameOffset, rescaleAsRequired, skelDimensionsRatio) {
    if (rescaleAsRequired === void 0) { rescaleAsRequired = false; }
    if (skelDimensionsRatio === void 0) { skelDimensionsRatio = null; }
    // all animation may be coming from a library skeleton, so may need to create animation
    if (this.animations.length === 0) {
        this.animations.push(new Animation(this.name, "_matrix", source.animations[0].framePerSecond, Animation.ANIMATIONTYPE_MATRIX, 0));
        this.animations[0].setKeys([]);
    }
    // get animation info / verify there is such a range from the source bone
    var sourceRange = source.animations[0].getRange(rangeName);
    if (!sourceRange) {
        return false;
    }
    var from = sourceRange.from;
    var to = sourceRange.to;
    var sourceKeys = source.animations[0].getKeys();
    // rescaling prep
    var sourceBoneLength = source.length;
    var sourceParent = source.getParent();
    var parent = this.getParent();
    var parentScalingReqd = rescaleAsRequired && sourceParent && sourceBoneLength && this.length && sourceBoneLength !== this.length;
    var parentRatio = parentScalingReqd && parent && sourceParent ? parent.length / sourceParent.length : 1;
    var dimensionsScalingReqd = rescaleAsRequired && !parent && skelDimensionsRatio && (skelDimensionsRatio.x !== 1 || skelDimensionsRatio.y !== 1 || skelDimensionsRatio.z !== 1);
    var destKeys = this.animations[0].getKeys();
    // loop vars declaration
    var orig;
    var origTranslation;
    var mat;
    for (var key = 0, nKeys = sourceKeys.length; key < nKeys; key++) {
        orig = sourceKeys[key];
        if (orig.frame >= from && orig.frame <= to) {
            if (rescaleAsRequired) {
                mat = orig.value.clone();
                // scale based on parent ratio, when bone has parent
                if (parentScalingReqd) {
                    origTranslation = mat.getTranslation();
                    mat.setTranslation(origTranslation.scaleInPlace(parentRatio));
                    // scale based on skeleton dimension ratio when root bone, and value is passed
                }
                else if (dimensionsScalingReqd && skelDimensionsRatio) {
                    origTranslation = mat.getTranslation();
                    mat.setTranslation(origTranslation.multiplyInPlace(skelDimensionsRatio));
                    // use original when root bone, and no data for skelDimensionsRatio
                }
                else {
                    mat = orig.value;
                }
            }
            else {
                mat = orig.value;
            }
            destKeys.push({ frame: orig.frame + frameOffset, value: mat });
        }
    }
    this.animations[0].createRange(rangeName, from + frameOffset, to + frameOffset);
    return true;
};

/**
 * This class defines the direct association between an animation and a target
 */
var TargetedAnimation = /** @class */ (function () {
    function TargetedAnimation() {
    }
    return TargetedAnimation;
}());
/**
 * Use this class to create coordinated animations on multiple targets
 */
var AnimationGroup = /** @class */ (function () {
    /**
     * Instantiates a new Animation Group.
     * This helps managing several animations at once.
     * @see http://doc.babylonjs.com/how_to/group
     * @param name Defines the name of the group
     * @param scene Defines the scene the group belongs to
     */
    function AnimationGroup(
    /** The name of the animation group */
    name, scene) {
        if (scene === void 0) { scene = null; }
        this.name = name;
        this._targetedAnimations = new Array();
        this._animatables = new Array();
        this._from = Number.MAX_VALUE;
        this._to = -Number.MAX_VALUE;
        this._speedRatio = 1;
        this._loopAnimation = false;
        /**
         * This observable will notify when one animation have ended
         */
        this.onAnimationEndObservable = new Observable();
        /**
         * Observer raised when one animation loops
         */
        this.onAnimationLoopObservable = new Observable();
        /**
         * This observable will notify when all animations have ended.
         */
        this.onAnimationGroupEndObservable = new Observable();
        /**
         * This observable will notify when all animations have paused.
         */
        this.onAnimationGroupPauseObservable = new Observable();
        /**
         * This observable will notify when all animations are playing.
         */
        this.onAnimationGroupPlayObservable = new Observable();
        this._scene = scene || EngineStore.LastCreatedScene;
        this.uniqueId = this._scene.getUniqueId();
        this._scene.animationGroups.push(this);
    }
    Object.defineProperty(AnimationGroup.prototype, "from", {
        /**
         * Gets the first frame
         */
        get: function () {
            return this._from;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "to", {
        /**
         * Gets the last frame
         */
        get: function () {
            return this._to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "isStarted", {
        /**
         * Define if the animations are started
         */
        get: function () {
            return this._isStarted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "isPlaying", {
        /**
         * Gets a value indicating that the current group is playing
         */
        get: function () {
            return this._isStarted && !this._isPaused;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "speedRatio", {
        /**
         * Gets or sets the speed ratio to use for all animations
         */
        get: function () {
            return this._speedRatio;
        },
        /**
         * Gets or sets the speed ratio to use for all animations
         */
        set: function (value) {
            if (this._speedRatio === value) {
                return;
            }
            this._speedRatio = value;
            for (var index = 0; index < this._animatables.length; index++) {
                var animatable = this._animatables[index];
                animatable.speedRatio = this._speedRatio;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "loopAnimation", {
        /**
         * Gets or sets if all animations should loop or not
         */
        get: function () {
            return this._loopAnimation;
        },
        set: function (value) {
            if (this._loopAnimation === value) {
                return;
            }
            this._loopAnimation = value;
            for (var index = 0; index < this._animatables.length; index++) {
                var animatable = this._animatables[index];
                animatable.loopAnimation = this._loopAnimation;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "targetedAnimations", {
        /**
         * Gets the targeted animations for this animation group
         */
        get: function () {
            return this._targetedAnimations;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationGroup.prototype, "animatables", {
        /**
         * returning the list of animatables controlled by this animation group.
         */
        get: function () {
            return this._animatables;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add an animation (with its target) in the group
     * @param animation defines the animation we want to add
     * @param target defines the target of the animation
     * @returns the TargetedAnimation object
     */
    AnimationGroup.prototype.addTargetedAnimation = function (animation, target) {
        var targetedAnimation = {
            animation: animation,
            target: target
        };
        var keys = animation.getKeys();
        if (this._from > keys[0].frame) {
            this._from = keys[0].frame;
        }
        if (this._to < keys[keys.length - 1].frame) {
            this._to = keys[keys.length - 1].frame;
        }
        this._targetedAnimations.push(targetedAnimation);
        return targetedAnimation;
    };
    /**
     * This function will normalize every animation in the group to make sure they all go from beginFrame to endFrame
     * It can add constant keys at begin or end
     * @param beginFrame defines the new begin frame for all animations or the smallest begin frame of all animations if null (defaults to null)
     * @param endFrame defines the new end frame for all animations or the largest end frame of all animations if null (defaults to null)
     * @returns the animation group
     */
    AnimationGroup.prototype.normalize = function (beginFrame, endFrame) {
        if (beginFrame === void 0) { beginFrame = null; }
        if (endFrame === void 0) { endFrame = null; }
        if (beginFrame == null) {
            beginFrame = this._from;
        }
        if (endFrame == null) {
            endFrame = this._to;
        }
        for (var index = 0; index < this._targetedAnimations.length; index++) {
            var targetedAnimation = this._targetedAnimations[index];
            var keys = targetedAnimation.animation.getKeys();
            var startKey = keys[0];
            var endKey = keys[keys.length - 1];
            if (startKey.frame > beginFrame) {
                var newKey = {
                    frame: beginFrame,
                    value: startKey.value,
                    inTangent: startKey.inTangent,
                    outTangent: startKey.outTangent,
                    interpolation: startKey.interpolation
                };
                keys.splice(0, 0, newKey);
            }
            if (endKey.frame < endFrame) {
                var newKey = {
                    frame: endFrame,
                    value: endKey.value,
                    inTangent: endKey.outTangent,
                    outTangent: endKey.outTangent,
                    interpolation: endKey.interpolation
                };
                keys.push(newKey);
            }
        }
        this._from = beginFrame;
        this._to = endFrame;
        return this;
    };
    /**
     * Start all animations on given targets
     * @param loop defines if animations must loop
     * @param speedRatio defines the ratio to apply to animation speed (1 by default)
     * @param from defines the from key (optional)
     * @param to defines the to key (optional)
     * @returns the current animation group
     */
    AnimationGroup.prototype.start = function (loop, speedRatio, from, to) {
        var _this = this;
        if (loop === void 0) { loop = false; }
        if (speedRatio === void 0) { speedRatio = 1; }
        if (this._isStarted || this._targetedAnimations.length === 0) {
            return this;
        }
        this._loopAnimation = loop;
        var _loop_1 = function (targetedAnimation) {
            var animatable = this_1._scene.beginDirectAnimation(targetedAnimation.target, [targetedAnimation.animation], from !== undefined ? from : this_1._from, to !== undefined ? to : this_1._to, loop, speedRatio);
            animatable.onAnimationEnd = function () {
                _this.onAnimationEndObservable.notifyObservers(targetedAnimation);
                _this._checkAnimationGroupEnded(animatable);
            };
            animatable.onAnimationLoop = function () {
                _this.onAnimationLoopObservable.notifyObservers(targetedAnimation);
            };
            this_1._animatables.push(animatable);
        };
        var this_1 = this;
        for (var _i = 0, _a = this._targetedAnimations; _i < _a.length; _i++) {
            var targetedAnimation = _a[_i];
            _loop_1(targetedAnimation);
        }
        this._speedRatio = speedRatio;
        if (from !== undefined && to !== undefined) {
            if (from < to && this._speedRatio < 0) {
                var temp = to;
                to = from;
                from = temp;
            }
            else if (from > to && this._speedRatio > 0) {
                this._speedRatio = -speedRatio;
            }
        }
        this._isStarted = true;
        this._isPaused = false;
        this.onAnimationGroupPlayObservable.notifyObservers(this);
        return this;
    };
    /**
     * Pause all animations
     * @returns the animation group
     */
    AnimationGroup.prototype.pause = function () {
        if (!this._isStarted) {
            return this;
        }
        this._isPaused = true;
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.pause();
        }
        this.onAnimationGroupPauseObservable.notifyObservers(this);
        return this;
    };
    /**
     * Play all animations to initial state
     * This function will start() the animations if they were not started or will restart() them if they were paused
     * @param loop defines if animations must loop
     * @returns the animation group
     */
    AnimationGroup.prototype.play = function (loop) {
        // only if all animatables are ready and exist
        if (this.isStarted && this._animatables.length === this._targetedAnimations.length) {
            if (loop !== undefined) {
                this.loopAnimation = loop;
            }
            this.restart();
        }
        else {
            this.stop();
            this.start(loop, this._speedRatio);
        }
        this._isPaused = false;
        return this;
    };
    /**
     * Reset all animations to initial state
     * @returns the animation group
     */
    AnimationGroup.prototype.reset = function () {
        if (!this._isStarted) {
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.reset();
        }
        return this;
    };
    /**
     * Restart animations from key 0
     * @returns the animation group
     */
    AnimationGroup.prototype.restart = function () {
        if (!this._isStarted) {
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.restart();
        }
        this.onAnimationGroupPlayObservable.notifyObservers(this);
        return this;
    };
    /**
     * Stop all animations
     * @returns the animation group
     */
    AnimationGroup.prototype.stop = function () {
        if (!this._isStarted) {
            return this;
        }
        var list = this._animatables.slice();
        for (var index = 0; index < list.length; index++) {
            list[index].stop();
        }
        this._isStarted = false;
        return this;
    };
    /**
     * Set animation weight for all animatables
     * @param weight defines the weight to use
     * @return the animationGroup
     * @see http://doc.babylonjs.com/babylon101/animations#animation-weights
     */
    AnimationGroup.prototype.setWeightForAllAnimatables = function (weight) {
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.weight = weight;
        }
        return this;
    };
    /**
     * Synchronize and normalize all animatables with a source animatable
     * @param root defines the root animatable to synchronize with
     * @return the animationGroup
     * @see http://doc.babylonjs.com/babylon101/animations#animation-weights
     */
    AnimationGroup.prototype.syncAllAnimationsWith = function (root) {
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.syncWith(root);
        }
        return this;
    };
    /**
     * Goes to a specific frame in this animation group
     * @param frame the frame number to go to
     * @return the animationGroup
     */
    AnimationGroup.prototype.goToFrame = function (frame) {
        if (!this._isStarted) {
            return this;
        }
        for (var index = 0; index < this._animatables.length; index++) {
            var animatable = this._animatables[index];
            animatable.goToFrame(frame);
        }
        return this;
    };
    /**
     * Dispose all associated resources
     */
    AnimationGroup.prototype.dispose = function () {
        this._targetedAnimations = [];
        this._animatables = [];
        var index = this._scene.animationGroups.indexOf(this);
        if (index > -1) {
            this._scene.animationGroups.splice(index, 1);
        }
        this.onAnimationEndObservable.clear();
        this.onAnimationGroupEndObservable.clear();
        this.onAnimationGroupPauseObservable.clear();
        this.onAnimationGroupPlayObservable.clear();
        this.onAnimationLoopObservable.clear();
    };
    AnimationGroup.prototype._checkAnimationGroupEnded = function (animatable) {
        // animatable should be taken out of the array
        var idx = this._animatables.indexOf(animatable);
        if (idx > -1) {
            this._animatables.splice(idx, 1);
        }
        // all animatables were removed? animation group ended!
        if (this._animatables.length === 0) {
            this._isStarted = false;
            this.onAnimationGroupEndObservable.notifyObservers(this);
        }
    };
    /**
     * Clone the current animation group and returns a copy
     * @param newName defines the name of the new group
     * @param targetConverter defines an optional function used to convert current animation targets to new ones
     * @returns the new aniamtion group
     */
    AnimationGroup.prototype.clone = function (newName, targetConverter) {
        var newGroup = new AnimationGroup(newName || this.name, this._scene);
        for (var _i = 0, _a = this._targetedAnimations; _i < _a.length; _i++) {
            var targetAnimation = _a[_i];
            newGroup.addTargetedAnimation(targetAnimation.animation.clone(), targetConverter ? targetConverter(targetAnimation.target) : targetAnimation.target);
        }
        return newGroup;
    };
    // Statics
    /**
     * Returns a new AnimationGroup object parsed from the source provided.
     * @param parsedAnimationGroup defines the source
     * @param scene defines the scene that will receive the animationGroup
     * @returns a new AnimationGroup
     */
    AnimationGroup.Parse = function (parsedAnimationGroup, scene) {
        var animationGroup = new AnimationGroup(parsedAnimationGroup.name, scene);
        for (var i = 0; i < parsedAnimationGroup.targetedAnimations.length; i++) {
            var targetedAnimation = parsedAnimationGroup.targetedAnimations[i];
            var animation = Animation.Parse(targetedAnimation.animation);
            var id = targetedAnimation.targetId;
            if (targetedAnimation.animation.property === "influence") { // morph target animation
                var morphTarget = scene.getMorphTargetById(id);
                if (morphTarget) {
                    animationGroup.addTargetedAnimation(animation, morphTarget);
                }
            }
            else {
                var targetNode = scene.getNodeByID(id);
                if (targetNode != null) {
                    animationGroup.addTargetedAnimation(animation, targetNode);
                }
            }
        }
        if (parsedAnimationGroup.from !== null && parsedAnimationGroup.from !== null) {
            animationGroup.normalize(parsedAnimationGroup.from, parsedAnimationGroup.to);
        }
        return animationGroup;
    };
    /**
     * Returns the string "AnimationGroup"
     * @returns "AnimationGroup"
     */
    AnimationGroup.prototype.getClassName = function () {
        return "AnimationGroup";
    };
    /**
     * Creates a detailled string about the object
     * @param fullDetails defines if the output string will support multiple levels of logging within scene loading
     * @returns a string representing the object
     */
    AnimationGroup.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name;
        ret += ", type: " + this.getClassName();
        if (fullDetails) {
            ret += ", from: " + this._from;
            ret += ", to: " + this._to;
            ret += ", isStarted: " + this._isStarted;
            ret += ", speedRatio: " + this._speedRatio;
            ret += ", targetedAnimations length: " + this._targetedAnimations.length;
            ret += ", animatables length: " + this._animatables;
        }
        return ret;
    };
    return AnimationGroup;
}());

/**
 * Composed of a frame, and an action function
 */
var AnimationEvent = /** @class */ (function () {
    /**
     * Initializes the animation event
     * @param frame The frame for which the event is triggered
     * @param action The event to perform when triggered
     * @param onlyOnce Specifies if the event should be triggered only once
     */
    function AnimationEvent(
    /** The frame for which the event is triggered **/
    frame, 
    /** The event to perform when triggered **/
    action, 
    /** Specifies if the event should be triggered only once**/
    onlyOnce) {
        this.frame = frame;
        this.action = action;
        this.onlyOnce = onlyOnce;
        /**
         * Specifies if the animation event is done
         */
        this.isDone = false;
    }
    /** @hidden */
    AnimationEvent.prototype._clone = function () {
        return new AnimationEvent(this.frame, this.action, this.onlyOnce);
    };
    return AnimationEvent;
}());

/**
 * Set of assets to keep when moving a scene into an asset container.
 */
var KeepAssets = /** @class */ (function (_super) {
    __extends(KeepAssets, _super);
    function KeepAssets() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return KeepAssets;
}(AbstractScene));
/**
 * Container with a set of assets that can be added or removed from a scene.
 */
var AssetContainer = /** @class */ (function (_super) {
    __extends(AssetContainer, _super);
    /**
     * Instantiates an AssetContainer.
     * @param scene The scene the AssetContainer belongs to.
     */
    function AssetContainer(scene) {
        var _this = _super.call(this) || this;
        _this.scene = scene;
        _this["sounds"] = [];
        _this["effectLayers"] = [];
        _this["layers"] = [];
        _this["lensFlareSystems"] = [];
        _this["proceduralTextures"] = [];
        _this["reflectionProbes"] = [];
        return _this;
    }
    /**
     * Adds all the assets from the container to the scene.
     */
    AssetContainer.prototype.addAllToScene = function () {
        var _this = this;
        this.cameras.forEach(function (o) {
            _this.scene.addCamera(o);
        });
        this.lights.forEach(function (o) {
            _this.scene.addLight(o);
        });
        this.meshes.forEach(function (o) {
            _this.scene.addMesh(o);
        });
        this.skeletons.forEach(function (o) {
            _this.scene.addSkeleton(o);
        });
        this.animations.forEach(function (o) {
            _this.scene.addAnimation(o);
        });
        this.animationGroups.forEach(function (o) {
            _this.scene.addAnimationGroup(o);
        });
        this.multiMaterials.forEach(function (o) {
            _this.scene.addMultiMaterial(o);
        });
        this.materials.forEach(function (o) {
            _this.scene.addMaterial(o);
        });
        this.morphTargetManagers.forEach(function (o) {
            _this.scene.addMorphTargetManager(o);
        });
        this.geometries.forEach(function (o) {
            _this.scene.addGeometry(o);
        });
        this.transformNodes.forEach(function (o) {
            _this.scene.addTransformNode(o);
        });
        this.actionManagers.forEach(function (o) {
            _this.scene.addActionManager(o);
        });
        this.textures.forEach(function (o) {
            _this.scene.addTexture(o);
        });
        this.reflectionProbes.forEach(function (o) {
            _this.scene.addReflectionProbe(o);
        });
        if (this.environmentTexture) {
            this.scene.environmentTexture = this.environmentTexture;
        }
        for (var _i = 0, _a = this.scene._serializableComponents; _i < _a.length; _i++) {
            var component = _a[_i];
            component.addFromContainer(this);
        }
    };
    /**
     * Removes all the assets in the container from the scene
     */
    AssetContainer.prototype.removeAllFromScene = function () {
        var _this = this;
        this.cameras.forEach(function (o) {
            _this.scene.removeCamera(o);
        });
        this.lights.forEach(function (o) {
            _this.scene.removeLight(o);
        });
        this.meshes.forEach(function (o) {
            _this.scene.removeMesh(o);
        });
        this.skeletons.forEach(function (o) {
            _this.scene.removeSkeleton(o);
        });
        this.animations.forEach(function (o) {
            _this.scene.removeAnimation(o);
        });
        this.animationGroups.forEach(function (o) {
            _this.scene.removeAnimationGroup(o);
        });
        this.multiMaterials.forEach(function (o) {
            _this.scene.removeMultiMaterial(o);
        });
        this.materials.forEach(function (o) {
            _this.scene.removeMaterial(o);
        });
        this.morphTargetManagers.forEach(function (o) {
            _this.scene.removeMorphTargetManager(o);
        });
        this.geometries.forEach(function (o) {
            _this.scene.removeGeometry(o);
        });
        this.transformNodes.forEach(function (o) {
            _this.scene.removeTransformNode(o);
        });
        this.actionManagers.forEach(function (o) {
            _this.scene.removeActionManager(o);
        });
        this.textures.forEach(function (o) {
            _this.scene.removeTexture(o);
        });
        this.reflectionProbes.forEach(function (o) {
            _this.scene.removeReflectionProbe(o);
        });
        if (this.environmentTexture === this.scene.environmentTexture) {
            this.scene.environmentTexture = null;
        }
        for (var _i = 0, _a = this.scene._serializableComponents; _i < _a.length; _i++) {
            var component = _a[_i];
            component.removeFromContainer(this);
        }
    };
    /**
     * Disposes all the assets in the container
     */
    AssetContainer.prototype.dispose = function () {
        this.cameras.forEach(function (o) {
            o.dispose();
        });
        this.cameras = [];
        this.lights.forEach(function (o) {
            o.dispose();
        });
        this.lights = [];
        this.meshes.forEach(function (o) {
            o.dispose();
        });
        this.meshes = [];
        this.skeletons.forEach(function (o) {
            o.dispose();
        });
        this.skeletons = [];
        this.animationGroups.forEach(function (o) {
            o.dispose();
        });
        this.animationGroups = [];
        this.multiMaterials.forEach(function (o) {
            o.dispose();
        });
        this.multiMaterials = [];
        this.materials.forEach(function (o) {
            o.dispose();
        });
        this.materials = [];
        this.geometries.forEach(function (o) {
            o.dispose();
        });
        this.geometries = [];
        this.transformNodes.forEach(function (o) {
            o.dispose();
        });
        this.transformNodes = [];
        this.actionManagers.forEach(function (o) {
            o.dispose();
        });
        this.actionManagers = [];
        this.textures.forEach(function (o) {
            o.dispose();
        });
        this.textures = [];
        this.reflectionProbes.forEach(function (o) {
            o.dispose();
        });
        this.reflectionProbes = [];
        if (this.environmentTexture) {
            this.environmentTexture.dispose();
            this.environmentTexture = null;
        }
        for (var _i = 0, _a = this.scene._serializableComponents; _i < _a.length; _i++) {
            var component = _a[_i];
            component.removeFromContainer(this, true);
        }
    };
    AssetContainer.prototype._moveAssets = function (sourceAssets, targetAssets, keepAssets) {
        if (!sourceAssets) {
            return;
        }
        for (var _i = 0, sourceAssets_1 = sourceAssets; _i < sourceAssets_1.length; _i++) {
            var asset = sourceAssets_1[_i];
            var move = true;
            if (keepAssets) {
                for (var _a = 0, keepAssets_1 = keepAssets; _a < keepAssets_1.length; _a++) {
                    var keepAsset = keepAssets_1[_a];
                    if (asset === keepAsset) {
                        move = false;
                        break;
                    }
                }
            }
            if (move) {
                targetAssets.push(asset);
            }
        }
    };
    /**
     * Removes all the assets contained in the scene and adds them to the container.
     * @param keepAssets Set of assets to keep in the scene. (default: empty)
     */
    AssetContainer.prototype.moveAllFromScene = function (keepAssets) {
        if (keepAssets === undefined) {
            keepAssets = new KeepAssets();
        }
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = this[key] || [];
                this._moveAssets(this.scene[key], this[key], keepAssets[key]);
            }
        }
        this.removeAllFromScene();
    };
    /**
     * Adds all meshes in the asset container to a root mesh that can be used to position all the contained meshes. The root mesh is then added to the front of the meshes in the assetContainer.
     * @returns the root mesh
     */
    AssetContainer.prototype.createRootMesh = function () {
        var rootMesh = new Mesh("assetContainerRootMesh", this.scene);
        this.meshes.forEach(function (m) {
            if (!m.parent) {
                rootMesh.addChild(m);
            }
        });
        this.meshes.unshift(rootMesh);
        return rootMesh;
    };
    return AssetContainer;
}(AbstractScene));

/**
 * Defines a sound that can be played in the application.
 * The sound can either be an ambient track or a simple sound played in reaction to a user action.
 * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music
 */
var Sound = /** @class */ (function () {
    /**
    * Create a sound and attach it to a scene
    * @param name Name of your sound
    * @param urlOrArrayBuffer Url to the sound to load async or ArrayBuffer, it also works with MediaStreams
    * @param scene defines the scene the sound belongs to
    * @param readyToPlayCallback Provide a callback function if you'd like to load your code once the sound is ready to be played
    * @param options Objects to provide with the current available options: autoplay, loop, volume, spatialSound, maxDistance, rolloffFactor, refDistance, distanceModel, panningModel, streaming
    */
    function Sound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options) {
        var _this = this;
        if (readyToPlayCallback === void 0) { readyToPlayCallback = null; }
        /**
         * Does the sound autoplay once loaded.
         */
        this.autoplay = false;
        /**
         * Does the sound loop after it finishes playing once.
         */
        this.loop = false;
        /**
         * Does the sound use a custom attenuation curve to simulate the falloff
         * happening when the source gets further away from the camera.
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-your-own-custom-attenuation-function
         */
        this.useCustomAttenuation = false;
        /**
         * Is this sound currently played.
         */
        this.isPlaying = false;
        /**
         * Is this sound currently paused.
         */
        this.isPaused = false;
        /**
         * Does this sound enables spatial sound.
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.spatialSound = false;
        /**
         * Define the reference distance the sound should be heard perfectly.
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.refDistance = 1;
        /**
         * Define the roll off factor of spatial sounds.
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.rolloffFactor = 1;
        /**
         * Define the max distance the sound should be heard (intensity just became 0 at this point).
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.maxDistance = 100;
        /**
         * Define the distance attenuation model the sound will follow.
         * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
         */
        this.distanceModel = "linear";
        /**
         * Observable event when the current playing sound finishes.
         */
        this.onEndedObservable = new Observable();
        this._panningModel = "equalpower";
        this._playbackRate = 1;
        this._streaming = false;
        this._startTime = 0;
        this._startOffset = 0;
        this._position = Vector3.Zero();
        /** @hidden */
        this._positionInEmitterSpace = false;
        this._localDirection = new Vector3(1, 0, 0);
        this._volume = 1;
        this._isReadyToPlay = false;
        this._isDirectional = false;
        // Used if you'd like to create a directional sound.
        // If not set, the sound will be omnidirectional
        this._coneInnerAngle = 360;
        this._coneOuterAngle = 360;
        this._coneOuterGain = 0;
        this._isOutputConnected = false;
        this._urlType = "Unknown";
        this.name = name;
        this._scene = scene;
        Sound._SceneComponentInitialization(scene);
        this._readyToPlayCallback = readyToPlayCallback;
        // Default custom attenuation function is a linear attenuation
        this._customAttenuationFunction = function (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) {
            if (currentDistance < maxDistance) {
                return currentVolume * (1 - currentDistance / maxDistance);
            }
            else {
                return 0;
            }
        };
        if (options) {
            this.autoplay = options.autoplay || false;
            this.loop = options.loop || false;
            // if volume === 0, we need another way to check this option
            if (options.volume !== undefined) {
                this._volume = options.volume;
            }
            this.spatialSound = options.spatialSound || false;
            this.maxDistance = options.maxDistance || 100;
            this.useCustomAttenuation = options.useCustomAttenuation || false;
            this.rolloffFactor = options.rolloffFactor || 1;
            this.refDistance = options.refDistance || 1;
            this.distanceModel = options.distanceModel || "linear";
            this._playbackRate = options.playbackRate || 1;
            this._streaming = options.streaming || false;
        }
        if (Engine.audioEngine.canUseWebAudio && Engine.audioEngine.audioContext) {
            this._soundGain = Engine.audioEngine.audioContext.createGain();
            this._soundGain.gain.value = this._volume;
            this._inputAudioNode = this._soundGain;
            this._outputAudioNode = this._soundGain;
            if (this.spatialSound) {
                this._createSpatialParameters();
            }
            this._scene.mainSoundTrack.AddSound(this);
            var validParameter = true;
            // if no parameter is passed, you need to call setAudioBuffer yourself to prepare the sound
            if (urlOrArrayBuffer) {
                try {
                    if (typeof (urlOrArrayBuffer) === "string") {
                        this._urlType = "String";
                    }
                    else if (urlOrArrayBuffer instanceof ArrayBuffer) {
                        this._urlType = "ArrayBuffer";
                    }
                    else if (urlOrArrayBuffer instanceof MediaStream) {
                        this._urlType = "MediaStream";
                    }
                    else if (Array.isArray(urlOrArrayBuffer)) {
                        this._urlType = "Array";
                    }
                    var urls = [];
                    var codecSupportedFound = false;
                    switch (this._urlType) {
                        case "MediaStream":
                            this._streaming = true;
                            this._isReadyToPlay = true;
                            this._streamingSource = Engine.audioEngine.audioContext.createMediaStreamSource(urlOrArrayBuffer);
                            if (this.autoplay) {
                                this.play();
                            }
                            if (this._readyToPlayCallback) {
                                this._readyToPlayCallback();
                            }
                            break;
                        case "ArrayBuffer":
                            if (urlOrArrayBuffer.byteLength > 0) {
                                codecSupportedFound = true;
                                this._soundLoaded(urlOrArrayBuffer);
                            }
                            break;
                        case "String":
                            urls.push(urlOrArrayBuffer);
                        case "Array":
                            if (urls.length === 0) {
                                urls = urlOrArrayBuffer;
                            }
                            // If we found a supported format, we load it immediately and stop the loop
                            for (var i = 0; i < urls.length; i++) {
                                var url = urls[i];
                                if (url.indexOf(".mp3", url.length - 4) !== -1 && Engine.audioEngine.isMP3supported) {
                                    codecSupportedFound = true;
                                }
                                if (url.indexOf(".ogg", url.length - 4) !== -1 && Engine.audioEngine.isOGGsupported) {
                                    codecSupportedFound = true;
                                }
                                if (url.indexOf(".wav", url.length - 4) !== -1) {
                                    codecSupportedFound = true;
                                }
                                if (url.indexOf("blob:") !== -1) {
                                    codecSupportedFound = true;
                                }
                                if (codecSupportedFound) {
                                    // Loading sound using XHR2
                                    if (!this._streaming) {
                                        this._scene._loadFile(url, function (data) {
                                            _this._soundLoaded(data);
                                        }, undefined, true, true, function (exception) {
                                            if (exception) {
                                                Logger.Error("XHR " + exception.status + " error on: " + url + ".");
                                            }
                                            Logger.Error("Sound creation aborted.");
                                            _this._scene.mainSoundTrack.RemoveSound(_this);
                                        });
                                    }
                                    // Streaming sound using HTML5 Audio tag
                                    else {
                                        this._htmlAudioElement = new Audio(url);
                                        this._htmlAudioElement.controls = false;
                                        this._htmlAudioElement.loop = this.loop;
                                        Tools.SetCorsBehavior(url, this._htmlAudioElement);
                                        this._htmlAudioElement.preload = "auto";
                                        this._htmlAudioElement.addEventListener("canplaythrough", function () {
                                            _this._isReadyToPlay = true;
                                            if (_this.autoplay) {
                                                _this.play();
                                            }
                                            if (_this._readyToPlayCallback) {
                                                _this._readyToPlayCallback();
                                            }
                                        });
                                        document.body.appendChild(this._htmlAudioElement);
                                        this._htmlAudioElement.load();
                                    }
                                    break;
                                }
                            }
                            break;
                        default:
                            validParameter = false;
                            break;
                    }
                    if (!validParameter) {
                        Logger.Error("Parameter must be a URL to the sound, an Array of URLs (.mp3 & .ogg) or an ArrayBuffer of the sound.");
                    }
                    else {
                        if (!codecSupportedFound) {
                            this._isReadyToPlay = true;
                            // Simulating a ready to play event to avoid breaking code path
                            if (this._readyToPlayCallback) {
                                window.setTimeout(function () {
                                    if (_this._readyToPlayCallback) {
                                        _this._readyToPlayCallback();
                                    }
                                }, 1000);
                            }
                        }
                    }
                }
                catch (ex) {
                    Logger.Error("Unexpected error. Sound creation aborted.");
                    this._scene.mainSoundTrack.RemoveSound(this);
                }
            }
        }
        else {
            // Adding an empty sound to avoid breaking audio calls for non Web Audio browsers
            this._scene.mainSoundTrack.AddSound(this);
            if (!Engine.audioEngine.WarnedWebAudioUnsupported) {
                Logger.Error("Web Audio is not supported by your browser.");
                Engine.audioEngine.WarnedWebAudioUnsupported = true;
            }
            // Simulating a ready to play event to avoid breaking code for non web audio browsers
            if (this._readyToPlayCallback) {
                window.setTimeout(function () {
                    if (_this._readyToPlayCallback) {
                        _this._readyToPlayCallback();
                    }
                }, 1000);
            }
        }
    }
    /**
     * Release the sound and its associated resources
     */
    Sound.prototype.dispose = function () {
        if (Engine.audioEngine.canUseWebAudio) {
            if (this.isPlaying) {
                this.stop();
            }
            this._isReadyToPlay = false;
            if (this.soundTrackId === -1) {
                this._scene.mainSoundTrack.RemoveSound(this);
            }
            else if (this._scene.soundTracks) {
                this._scene.soundTracks[this.soundTrackId].RemoveSound(this);
            }
            if (this._soundGain) {
                this._soundGain.disconnect();
                this._soundGain = null;
            }
            if (this._soundPanner) {
                this._soundPanner.disconnect();
                this._soundPanner = null;
            }
            if (this._soundSource) {
                this._soundSource.disconnect();
                this._soundSource = null;
            }
            this._audioBuffer = null;
            if (this._htmlAudioElement) {
                this._htmlAudioElement.pause();
                this._htmlAudioElement.src = "";
                document.body.removeChild(this._htmlAudioElement);
            }
            if (this._streamingSource) {
                this._streamingSource.disconnect();
            }
            if (this._connectedTransformNode && this._registerFunc) {
                this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
                this._connectedTransformNode = null;
            }
        }
    };
    /**
     * Gets if the sounds is ready to be played or not.
     * @returns true if ready, otherwise false
     */
    Sound.prototype.isReady = function () {
        return this._isReadyToPlay;
    };
    Sound.prototype._soundLoaded = function (audioData) {
        var _this = this;
        if (!Engine.audioEngine.audioContext) {
            return;
        }
        Engine.audioEngine.audioContext.decodeAudioData(audioData, function (buffer) {
            _this._audioBuffer = buffer;
            _this._isReadyToPlay = true;
            if (_this.autoplay) {
                _this.play();
            }
            if (_this._readyToPlayCallback) {
                _this._readyToPlayCallback();
            }
        }, function (err) { Logger.Error("Error while decoding audio data for: " + _this.name + " / Error: " + err); });
    };
    /**
     * Sets the data of the sound from an audiobuffer
     * @param audioBuffer The audioBuffer containing the data
     */
    Sound.prototype.setAudioBuffer = function (audioBuffer) {
        if (Engine.audioEngine.canUseWebAudio) {
            this._audioBuffer = audioBuffer;
            this._isReadyToPlay = true;
        }
    };
    /**
     * Updates the current sounds options such as maxdistance, loop...
     * @param options A JSON object containing values named as the object properties
     */
    Sound.prototype.updateOptions = function (options) {
        if (options) {
            this.loop = options.loop || this.loop;
            this.maxDistance = options.maxDistance || this.maxDistance;
            this.useCustomAttenuation = options.useCustomAttenuation || this.useCustomAttenuation;
            this.rolloffFactor = options.rolloffFactor || this.rolloffFactor;
            this.refDistance = options.refDistance || this.refDistance;
            this.distanceModel = options.distanceModel || this.distanceModel;
            this._playbackRate = options.playbackRate || this._playbackRate;
            this._updateSpatialParameters();
            if (this.isPlaying) {
                if (this._streaming && this._htmlAudioElement) {
                    this._htmlAudioElement.playbackRate = this._playbackRate;
                }
                else {
                    if (this._soundSource) {
                        this._soundSource.playbackRate.value = this._playbackRate;
                    }
                }
            }
        }
    };
    Sound.prototype._createSpatialParameters = function () {
        if (Engine.audioEngine.canUseWebAudio && Engine.audioEngine.audioContext) {
            if (this._scene.headphone) {
                this._panningModel = "HRTF";
            }
            this._soundPanner = Engine.audioEngine.audioContext.createPanner();
            this._updateSpatialParameters();
            this._soundPanner.connect(this._outputAudioNode);
            this._inputAudioNode = this._soundPanner;
        }
    };
    Sound.prototype._updateSpatialParameters = function () {
        if (this.spatialSound && this._soundPanner) {
            if (this.useCustomAttenuation) {
                // Tricks to disable in a way embedded Web Audio attenuation
                this._soundPanner.distanceModel = "linear";
                this._soundPanner.maxDistance = Number.MAX_VALUE;
                this._soundPanner.refDistance = 1;
                this._soundPanner.rolloffFactor = 1;
                this._soundPanner.panningModel = this._panningModel;
            }
            else {
                this._soundPanner.distanceModel = this.distanceModel;
                this._soundPanner.maxDistance = this.maxDistance;
                this._soundPanner.refDistance = this.refDistance;
                this._soundPanner.rolloffFactor = this.rolloffFactor;
                this._soundPanner.panningModel = this._panningModel;
            }
        }
    };
    /**
     * Switch the panning model to HRTF:
     * Renders a stereo output of higher quality than equalpower — it uses a convolution with measured impulse responses from human subjects.
     * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    Sound.prototype.switchPanningModelToHRTF = function () {
        this._panningModel = "HRTF";
        this._switchPanningModel();
    };
    /**
     * Switch the panning model to Equal Power:
     * Represents the equal-power panning algorithm, generally regarded as simple and efficient. equalpower is the default value.
     * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-a-spatial-3d-sound
     */
    Sound.prototype.switchPanningModelToEqualPower = function () {
        this._panningModel = "equalpower";
        this._switchPanningModel();
    };
    Sound.prototype._switchPanningModel = function () {
        if (Engine.audioEngine.canUseWebAudio && this.spatialSound && this._soundPanner) {
            this._soundPanner.panningModel = this._panningModel;
        }
    };
    /**
     * Connect this sound to a sound track audio node like gain...
     * @param soundTrackAudioNode the sound track audio node to connect to
     */
    Sound.prototype.connectToSoundTrackAudioNode = function (soundTrackAudioNode) {
        if (Engine.audioEngine.canUseWebAudio) {
            if (this._isOutputConnected) {
                this._outputAudioNode.disconnect();
            }
            this._outputAudioNode.connect(soundTrackAudioNode);
            this._isOutputConnected = true;
        }
    };
    /**
    * Transform this sound into a directional source
    * @param coneInnerAngle Size of the inner cone in degree
    * @param coneOuterAngle Size of the outer cone in degree
    * @param coneOuterGain Volume of the sound outside the outer cone (between 0.0 and 1.0)
    */
    Sound.prototype.setDirectionalCone = function (coneInnerAngle, coneOuterAngle, coneOuterGain) {
        if (coneOuterAngle < coneInnerAngle) {
            Logger.Error("setDirectionalCone(): outer angle of the cone must be superior or equal to the inner angle.");
            return;
        }
        this._coneInnerAngle = coneInnerAngle;
        this._coneOuterAngle = coneOuterAngle;
        this._coneOuterGain = coneOuterGain;
        this._isDirectional = true;
        if (this.isPlaying && this.loop) {
            this.stop();
            this.play();
        }
    };
    Object.defineProperty(Sound.prototype, "directionalConeInnerAngle", {
        /**
         * Gets or sets the inner angle for the directional cone.
         */
        get: function () {
            return this._coneInnerAngle;
        },
        /**
         * Gets or sets the inner angle for the directional cone.
         */
        set: function (value) {
            if (value != this._coneInnerAngle) {
                if (this._coneOuterAngle < value) {
                    Logger.Error("directionalConeInnerAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneInnerAngle = value;
                if (Engine.audioEngine.canUseWebAudio && this.spatialSound && this._soundPanner) {
                    this._soundPanner.coneInnerAngle = this._coneInnerAngle;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "directionalConeOuterAngle", {
        /**
         * Gets or sets the outer angle for the directional cone.
         */
        get: function () {
            return this._coneOuterAngle;
        },
        /**
         * Gets or sets the outer angle for the directional cone.
         */
        set: function (value) {
            if (value != this._coneOuterAngle) {
                if (value < this._coneInnerAngle) {
                    Logger.Error("directionalConeOuterAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneOuterAngle = value;
                if (Engine.audioEngine.canUseWebAudio && this.spatialSound && this._soundPanner) {
                    this._soundPanner.coneOuterAngle = this._coneOuterAngle;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the position of the emitter if spatial sound is enabled
     * @param newPosition Defines the new posisiton
     */
    Sound.prototype.setPosition = function (newPosition) {
        this._position = newPosition;
        if (Engine.audioEngine.canUseWebAudio && this.spatialSound && this._soundPanner && !isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
            this._soundPanner.setPosition(this._position.x, this._position.y, this._position.z);
        }
    };
    /**
     * Sets the local direction of the emitter if spatial sound is enabled
     * @param newLocalDirection Defines the new local direction
     */
    Sound.prototype.setLocalDirectionToMesh = function (newLocalDirection) {
        this._localDirection = newLocalDirection;
        if (Engine.audioEngine.canUseWebAudio && this._connectedTransformNode && this.isPlaying) {
            this._updateDirection();
        }
    };
    Sound.prototype._updateDirection = function () {
        if (!this._connectedTransformNode || !this._soundPanner) {
            return;
        }
        var mat = this._connectedTransformNode.getWorldMatrix();
        var direction = Vector3.TransformNormal(this._localDirection, mat);
        direction.normalize();
        this._soundPanner.setOrientation(direction.x, direction.y, direction.z);
    };
    /** @hidden */
    Sound.prototype.updateDistanceFromListener = function () {
        if (Engine.audioEngine.canUseWebAudio && this._connectedTransformNode && this.useCustomAttenuation && this._soundGain && this._scene.activeCamera) {
            var distance = this._connectedTransformNode.getDistanceToCamera(this._scene.activeCamera);
            this._soundGain.gain.value = this._customAttenuationFunction(this._volume, distance, this.maxDistance, this.refDistance, this.rolloffFactor);
        }
    };
    /**
     * Sets a new custom attenuation function for the sound.
     * @param callback Defines the function used for the attenuation
     * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#creating-your-own-custom-attenuation-function
     */
    Sound.prototype.setAttenuationFunction = function (callback) {
        this._customAttenuationFunction = callback;
    };
    /**
    * Play the sound
    * @param time (optional) Start the sound after X seconds. Start immediately (0) by default.
    * @param offset (optional) Start the sound setting it at a specific time
    */
    Sound.prototype.play = function (time, offset) {
        var _this = this;
        if (this._isReadyToPlay && this._scene.audioEnabled && Engine.audioEngine.audioContext) {
            try {
                if (this._startOffset < 0) {
                    time = -this._startOffset;
                    this._startOffset = 0;
                }
                var startTime = time ? Engine.audioEngine.audioContext.currentTime + time : Engine.audioEngine.audioContext.currentTime;
                if (!this._soundSource || !this._streamingSource) {
                    if (this.spatialSound && this._soundPanner) {
                        if (!isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
                            this._soundPanner.setPosition(this._position.x, this._position.y, this._position.z);
                        }
                        if (this._isDirectional) {
                            this._soundPanner.coneInnerAngle = this._coneInnerAngle;
                            this._soundPanner.coneOuterAngle = this._coneOuterAngle;
                            this._soundPanner.coneOuterGain = this._coneOuterGain;
                            if (this._connectedTransformNode) {
                                this._updateDirection();
                            }
                            else {
                                this._soundPanner.setOrientation(this._localDirection.x, this._localDirection.y, this._localDirection.z);
                            }
                        }
                    }
                }
                if (this._streaming) {
                    if (!this._streamingSource) {
                        this._streamingSource = Engine.audioEngine.audioContext.createMediaElementSource(this._htmlAudioElement);
                        this._htmlAudioElement.onended = function () { _this._onended(); };
                        this._htmlAudioElement.playbackRate = this._playbackRate;
                    }
                    this._streamingSource.disconnect();
                    this._streamingSource.connect(this._inputAudioNode);
                    if (this._htmlAudioElement) {
                        // required to manage properly the new suspended default state of Chrome
                        // When the option 'streaming: true' is used, we need first to wait for
                        // the audio engine to be unlocked by a user gesture before trying to play
                        // an HTML Audio elememt
                        var tryToPlay = function () {
                            if (Engine.audioEngine.unlocked) {
                                var playPromise = _this._htmlAudioElement.play();
                                // In browsers that don’t yet support this functionality,
                                // playPromise won’t be defined.
                                if (playPromise !== undefined) {
                                    playPromise.catch(function (error) {
                                        // Automatic playback failed.
                                        // Waiting for the audio engine to be unlocked by user click on unmute
                                        Engine.audioEngine.lock();
                                        if (_this.loop || _this.autoplay) {
                                            Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () { tryToPlay(); });
                                        }
                                    });
                                }
                            }
                            else {
                                if (_this.loop || _this.autoplay) {
                                    Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () { tryToPlay(); });
                                }
                            }
                        };
                        tryToPlay();
                    }
                }
                else {
                    var tryToPlay = function () {
                        if (Engine.audioEngine.audioContext) {
                            _this._soundSource = Engine.audioEngine.audioContext.createBufferSource();
                            _this._soundSource.buffer = _this._audioBuffer;
                            _this._soundSource.connect(_this._inputAudioNode);
                            _this._soundSource.loop = _this.loop;
                            _this._soundSource.playbackRate.value = _this._playbackRate;
                            _this._soundSource.onended = function () { _this._onended(); };
                            startTime = time ? Engine.audioEngine.audioContext.currentTime + time : Engine.audioEngine.audioContext.currentTime;
                            _this._soundSource.start(startTime, _this.isPaused ? _this._startOffset % _this._soundSource.buffer.duration : offset ? offset : 0);
                        }
                    };
                    if (Engine.audioEngine.audioContext.state === "suspended") {
                        // Wait a bit for FF as context seems late to be ready.
                        setTimeout(function () {
                            if (Engine.audioEngine.audioContext.state === "suspended") {
                                // Automatic playback failed.
                                // Waiting for the audio engine to be unlocked by user click on unmute
                                Engine.audioEngine.lock();
                                if (_this.loop || _this.autoplay) {
                                    Engine.audioEngine.onAudioUnlockedObservable.addOnce(function () { tryToPlay(); });
                                }
                            }
                            else {
                                tryToPlay();
                            }
                        }, 500);
                    }
                    else {
                        tryToPlay();
                    }
                }
                this._startTime = startTime;
                this.isPlaying = true;
                this.isPaused = false;
            }
            catch (ex) {
                Logger.Error("Error while trying to play audio: " + this.name + ", " + ex.message);
            }
        }
    };
    Sound.prototype._onended = function () {
        this.isPlaying = false;
        if (this.onended) {
            this.onended();
        }
        this.onEndedObservable.notifyObservers(this);
    };
    /**
    * Stop the sound
    * @param time (optional) Stop the sound after X seconds. Stop immediately (0) by default.
    */
    Sound.prototype.stop = function (time) {
        var _this = this;
        if (this.isPlaying) {
            if (this._streaming) {
                if (this._htmlAudioElement) {
                    this._htmlAudioElement.pause();
                    // Test needed for Firefox or it will generate an Invalid State Error
                    if (this._htmlAudioElement.currentTime > 0) {
                        this._htmlAudioElement.currentTime = 0;
                    }
                }
                else {
                    this._streamingSource.disconnect();
                }
                this.isPlaying = false;
            }
            else if (Engine.audioEngine.audioContext && this._soundSource) {
                var stopTime = time ? Engine.audioEngine.audioContext.currentTime + time : Engine.audioEngine.audioContext.currentTime;
                this._soundSource.stop(stopTime);
                this._soundSource.onended = function () { _this.isPlaying = false; };
                if (!this.isPaused) {
                    this._startOffset = 0;
                }
            }
        }
    };
    /**
     * Put the sound in pause
     */
    Sound.prototype.pause = function () {
        if (this.isPlaying) {
            this.isPaused = true;
            if (this._streaming) {
                if (this._htmlAudioElement) {
                    this._htmlAudioElement.pause();
                }
                else {
                    this._streamingSource.disconnect();
                }
            }
            else if (Engine.audioEngine.audioContext) {
                this.stop(0);
                this._startOffset += Engine.audioEngine.audioContext.currentTime - this._startTime;
            }
        }
    };
    /**
     * Sets a dedicated volume for this sounds
     * @param newVolume Define the new volume of the sound
     * @param time Define in how long the sound should be at this value
     */
    Sound.prototype.setVolume = function (newVolume, time) {
        if (Engine.audioEngine.canUseWebAudio && this._soundGain) {
            if (time && Engine.audioEngine.audioContext) {
                this._soundGain.gain.cancelScheduledValues(Engine.audioEngine.audioContext.currentTime);
                this._soundGain.gain.setValueAtTime(this._soundGain.gain.value, Engine.audioEngine.audioContext.currentTime);
                this._soundGain.gain.linearRampToValueAtTime(newVolume, Engine.audioEngine.audioContext.currentTime + time);
            }
            else {
                this._soundGain.gain.value = newVolume;
            }
        }
        this._volume = newVolume;
    };
    /**
     * Set the sound play back rate
     * @param newPlaybackRate Define the playback rate the sound should be played at
     */
    Sound.prototype.setPlaybackRate = function (newPlaybackRate) {
        this._playbackRate = newPlaybackRate;
        if (this.isPlaying) {
            if (this._streaming && this._htmlAudioElement) {
                this._htmlAudioElement.playbackRate = this._playbackRate;
            }
            else if (this._soundSource) {
                this._soundSource.playbackRate.value = this._playbackRate;
            }
        }
    };
    /**
     * Gets the volume of the sound.
     * @returns the volume of the sound
     */
    Sound.prototype.getVolume = function () {
        return this._volume;
    };
    /**
     * Attach the sound to a dedicated mesh
     * @param transformNode The transform node to connect the sound with
     * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#attaching-a-sound-to-a-mesh
     */
    Sound.prototype.attachToMesh = function (transformNode) {
        var _this = this;
        if (this._connectedTransformNode && this._registerFunc) {
            this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
            this._registerFunc = null;
        }
        this._connectedTransformNode = transformNode;
        if (!this.spatialSound) {
            this.spatialSound = true;
            this._createSpatialParameters();
            if (this.isPlaying && this.loop) {
                this.stop();
                this.play();
            }
        }
        this._onRegisterAfterWorldMatrixUpdate(this._connectedTransformNode);
        this._registerFunc = function (transformNode) { return _this._onRegisterAfterWorldMatrixUpdate(transformNode); };
        this._connectedTransformNode.registerAfterWorldMatrixUpdate(this._registerFunc);
    };
    /**
     * Detach the sound from the previously attached mesh
     * @see http://doc.babylonjs.com/how_to/playing_sounds_and_music#attaching-a-sound-to-a-mesh
     */
    Sound.prototype.detachFromMesh = function () {
        if (this._connectedTransformNode && this._registerFunc) {
            this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
            this._registerFunc = null;
            this._connectedTransformNode = null;
        }
    };
    Sound.prototype._onRegisterAfterWorldMatrixUpdate = function (node) {
        if (!node.getBoundingInfo) {
            return;
        }
        var mesh = node;
        if (this._positionInEmitterSpace) {
            mesh.worldMatrixFromCache.invertToRef(Tmp.Matrix[0]);
            this.setPosition(Tmp.Matrix[0].getTranslation());
        }
        else {
            var boundingInfo = mesh.getBoundingInfo();
            this.setPosition(boundingInfo.boundingSphere.centerWorld);
        }
        if (Engine.audioEngine.canUseWebAudio && this._isDirectional && this.isPlaying) {
            this._updateDirection();
        }
    };
    /**
     * Clone the current sound in the scene.
     * @returns the new sound clone
     */
    Sound.prototype.clone = function () {
        var _this = this;
        if (!this._streaming) {
            var setBufferAndRun = function () {
                if (_this._isReadyToPlay) {
                    clonedSound._audioBuffer = _this.getAudioBuffer();
                    clonedSound._isReadyToPlay = true;
                    if (clonedSound.autoplay) {
                        clonedSound.play();
                    }
                }
                else {
                    window.setTimeout(setBufferAndRun, 300);
                }
            };
            var currentOptions = {
                autoplay: this.autoplay, loop: this.loop,
                volume: this._volume, spatialSound: this.spatialSound, maxDistance: this.maxDistance,
                useCustomAttenuation: this.useCustomAttenuation, rolloffFactor: this.rolloffFactor,
                refDistance: this.refDistance, distanceModel: this.distanceModel
            };
            var clonedSound = new Sound(this.name + "_cloned", new ArrayBuffer(0), this._scene, null, currentOptions);
            if (this.useCustomAttenuation) {
                clonedSound.setAttenuationFunction(this._customAttenuationFunction);
            }
            clonedSound.setPosition(this._position);
            clonedSound.setPlaybackRate(this._playbackRate);
            setBufferAndRun();
            return clonedSound;
        }
        // Can't clone a streaming sound
        else {
            return null;
        }
    };
    /**
     * Gets the current underlying audio buffer containing the data
     * @returns the audio buffer
     */
    Sound.prototype.getAudioBuffer = function () {
        return this._audioBuffer;
    };
    /**
     * Serializes the Sound in a JSON representation
     * @returns the JSON representation of the sound
     */
    Sound.prototype.serialize = function () {
        var serializationObject = {
            name: this.name,
            url: this.name,
            autoplay: this.autoplay,
            loop: this.loop,
            volume: this._volume,
            spatialSound: this.spatialSound,
            maxDistance: this.maxDistance,
            rolloffFactor: this.rolloffFactor,
            refDistance: this.refDistance,
            distanceModel: this.distanceModel,
            playbackRate: this._playbackRate,
            panningModel: this._panningModel,
            soundTrackId: this.soundTrackId
        };
        if (this.spatialSound) {
            if (this._connectedTransformNode) {
                serializationObject.connectedMeshId = this._connectedTransformNode.id;
            }
            serializationObject.position = this._position.asArray();
            serializationObject.refDistance = this.refDistance;
            serializationObject.distanceModel = this.distanceModel;
            serializationObject.isDirectional = this._isDirectional;
            serializationObject.localDirectionToMesh = this._localDirection.asArray();
            serializationObject.coneInnerAngle = this._coneInnerAngle;
            serializationObject.coneOuterAngle = this._coneOuterAngle;
            serializationObject.coneOuterGain = this._coneOuterGain;
        }
        return serializationObject;
    };
    /**
     * Parse a JSON representation of a sound to innstantiate in a given scene
     * @param parsedSound Define the JSON representation of the sound (usually coming from the serialize method)
     * @param scene Define the scene the new parsed sound should be created in
     * @param rootUrl Define the rooturl of the load in case we need to fetch relative dependencies
     * @param sourceSound Define a cound place holder if do not need to instantiate a new one
     * @returns the newly parsed sound
     */
    Sound.Parse = function (parsedSound, scene, rootUrl, sourceSound) {
        var soundName = parsedSound.name;
        var soundUrl;
        if (parsedSound.url) {
            soundUrl = rootUrl + parsedSound.url;
        }
        else {
            soundUrl = rootUrl + soundName;
        }
        var options = {
            autoplay: parsedSound.autoplay, loop: parsedSound.loop, volume: parsedSound.volume,
            spatialSound: parsedSound.spatialSound, maxDistance: parsedSound.maxDistance,
            rolloffFactor: parsedSound.rolloffFactor,
            refDistance: parsedSound.refDistance,
            distanceModel: parsedSound.distanceModel,
            playbackRate: parsedSound.playbackRate
        };
        var newSound;
        if (!sourceSound) {
            newSound = new Sound(soundName, soundUrl, scene, function () { scene._removePendingData(newSound); }, options);
            scene._addPendingData(newSound);
        }
        else {
            var setBufferAndRun = function () {
                if (sourceSound._isReadyToPlay) {
                    newSound._audioBuffer = sourceSound.getAudioBuffer();
                    newSound._isReadyToPlay = true;
                    if (newSound.autoplay) {
                        newSound.play();
                    }
                }
                else {
                    window.setTimeout(setBufferAndRun, 300);
                }
            };
            newSound = new Sound(soundName, new ArrayBuffer(0), scene, null, options);
            setBufferAndRun();
        }
        if (parsedSound.position) {
            var soundPosition = Vector3.FromArray(parsedSound.position);
            newSound.setPosition(soundPosition);
        }
        if (parsedSound.isDirectional) {
            newSound.setDirectionalCone(parsedSound.coneInnerAngle || 360, parsedSound.coneOuterAngle || 360, parsedSound.coneOuterGain || 0);
            if (parsedSound.localDirectionToMesh) {
                var localDirectionToMesh = Vector3.FromArray(parsedSound.localDirectionToMesh);
                newSound.setLocalDirectionToMesh(localDirectionToMesh);
            }
        }
        if (parsedSound.connectedMeshId) {
            var connectedMesh = scene.getMeshByID(parsedSound.connectedMeshId);
            if (connectedMesh) {
                newSound.attachToMesh(connectedMesh);
            }
        }
        return newSound;
    };
    /** @hidden */
    Sound._SceneComponentInitialization = function (_) {
        throw _DevTools.WarnImport("AudioSceneComponent");
    };
    return Sound;
}());

/**
 * Wraps one or more Sound objects and selects one with random weight for playback.
 */
var WeightedSound = /** @class */ (function () {
    /**
     * Creates a new WeightedSound from the list of sounds given.
     * @param loop When true a Sound will be selected and played when the current playing Sound completes.
     * @param sounds Array of Sounds that will be selected from.
     * @param weights Array of number values for selection weights; length must equal sounds, values will be normalized to 1
     */
    function WeightedSound(loop, sounds, weights) {
        var _this = this;
        /** When true a Sound will be selected and played when the current playing Sound completes. */
        this.loop = false;
        this._coneInnerAngle = 360;
        this._coneOuterAngle = 360;
        this._volume = 1;
        /** A Sound is currently playing. */
        this.isPlaying = false;
        /** A Sound is currently paused. */
        this.isPaused = false;
        this._sounds = [];
        this._weights = [];
        if (sounds.length !== weights.length) {
            throw new Error('Sounds length does not equal weights length');
        }
        this.loop = loop;
        this._weights = weights;
        // Normalize the weights
        var weightSum = 0;
        for (var _i = 0, weights_1 = weights; _i < weights_1.length; _i++) {
            var weight = weights_1[_i];
            weightSum += weight;
        }
        var invWeightSum = weightSum > 0 ? 1 / weightSum : 0;
        for (var i = 0; i < this._weights.length; i++) {
            this._weights[i] *= invWeightSum;
        }
        this._sounds = sounds;
        for (var _a = 0, _b = this._sounds; _a < _b.length; _a++) {
            var sound = _b[_a];
            sound.onEndedObservable.add(function () { _this._onended(); });
        }
    }
    Object.defineProperty(WeightedSound.prototype, "directionalConeInnerAngle", {
        /**
         * The size of cone in degrees for a directional sound in which there will be no attenuation.
         */
        get: function () {
            return this._coneInnerAngle;
        },
        /**
         * The size of cone in degress for a directional sound in which there will be no attenuation.
         */
        set: function (value) {
            if (value !== this._coneInnerAngle) {
                if (this._coneOuterAngle < value) {
                    Logger.Error("directionalConeInnerAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneInnerAngle = value;
                for (var _i = 0, _a = this._sounds; _i < _a.length; _i++) {
                    var sound = _a[_i];
                    sound.directionalConeInnerAngle = value;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WeightedSound.prototype, "directionalConeOuterAngle", {
        /**
         * Size of cone in degrees for a directional sound outside of which there will be no sound.
         * Listener angles between innerAngle and outerAngle will falloff linearly.
         */
        get: function () {
            return this._coneOuterAngle;
        },
        /**
         * Size of cone in degrees for a directional sound outside of which there will be no sound.
         * Listener angles between innerAngle and outerAngle will falloff linearly.
         */
        set: function (value) {
            if (value !== this._coneOuterAngle) {
                if (value < this._coneInnerAngle) {
                    Logger.Error("directionalConeOuterAngle: outer angle of the cone must be superior or equal to the inner angle.");
                    return;
                }
                this._coneOuterAngle = value;
                for (var _i = 0, _a = this._sounds; _i < _a.length; _i++) {
                    var sound = _a[_i];
                    sound.directionalConeOuterAngle = value;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WeightedSound.prototype, "volume", {
        /**
         * Playback volume.
         */
        get: function () {
            return this._volume;
        },
        /**
         * Playback volume.
         */
        set: function (value) {
            if (value !== this._volume) {
                for (var _i = 0, _a = this._sounds; _i < _a.length; _i++) {
                    var sound = _a[_i];
                    sound.setVolume(value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    WeightedSound.prototype._onended = function () {
        if (this._currentIndex !== undefined) {
            this._sounds[this._currentIndex].autoplay = false;
        }
        if (this.loop && this.isPlaying) {
            this.play();
        }
        else {
            this.isPlaying = false;
        }
    };
    /**
     * Suspend playback
     */
    WeightedSound.prototype.pause = function () {
        this.isPaused = true;
        if (this._currentIndex !== undefined) {
            this._sounds[this._currentIndex].pause();
        }
    };
    /**
     * Stop playback
     */
    WeightedSound.prototype.stop = function () {
        this.isPlaying = false;
        if (this._currentIndex !== undefined) {
            this._sounds[this._currentIndex].stop();
        }
    };
    /**
     * Start playback.
     * @param startOffset Position the clip head at a specific time in seconds.
     */
    WeightedSound.prototype.play = function (startOffset) {
        if (!this.isPaused) {
            this.stop();
            var randomValue = Math.random();
            var total = 0;
            for (var i = 0; i < this._weights.length; i++) {
                total += this._weights[i];
                if (randomValue <= total) {
                    this._currentIndex = i;
                    break;
                }
            }
        }
        var sound = this._sounds[this._currentIndex];
        if (sound.isReady()) {
            sound.play(0, this.isPaused ? undefined : startOffset);
        }
        else {
            sound.autoplay = true;
        }
        this.isPlaying = true;
        this.isPaused = false;
    };
    return WeightedSound;
}());

Engine.prototype.updateRawTexture = function (texture, data, format, invertY, compression, type) {
    if (compression === void 0) { compression = null; }
    if (type === void 0) { type = Engine.TEXTURETYPE_UNSIGNED_INT; }
    if (!texture) {
        return;
    }
    // Babylon's internalSizedFomat but gl's texImage2D internalFormat
    var internalSizedFomat = this._getRGBABufferInternalSizedFormat(type, format);
    // Babylon's internalFormat but gl's texImage2D format
    var internalFormat = this._getInternalFormat(format);
    var textureType = this._getWebGLTextureType(type);
    this._bindTextureDirectly(this._gl.TEXTURE_2D, texture, true);
    this._unpackFlipY(invertY === undefined ? true : (invertY ? true : false));
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
        texture.format = format;
        texture.type = type;
        texture.invertY = invertY;
        texture._compression = compression;
    }
    if (texture.width % 4 !== 0) {
        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);
    }
    if (compression && data) {
        this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this.getCaps().s3tc[compression], texture.width, texture.height, 0, data);
    }
    else {
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, internalSizedFomat, texture.width, texture.height, 0, internalFormat, textureType, data);
    }
    if (texture.generateMipMaps) {
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_2D, null);
    //  this.resetTextureCache();
    texture.isReady = true;
};
Engine.prototype.createRawTexture = function (data, width, height, format, generateMipMaps, invertY, samplingMode, compression, type) {
    if (compression === void 0) { compression = null; }
    if (type === void 0) { type = Engine.TEXTURETYPE_UNSIGNED_INT; }
    var texture = new InternalTexture(this, InternalTexture.DATASOURCE_RAW);
    texture.baseWidth = width;
    texture.baseHeight = height;
    texture.width = width;
    texture.height = height;
    texture.format = format;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    texture.invertY = invertY;
    texture._compression = compression;
    texture.type = type;
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
    }
    this.updateRawTexture(texture, data, format, invertY, compression, type);
    this._bindTextureDirectly(this._gl.TEXTURE_2D, texture, true);
    // Filters
    var filters = this._getSamplingParameters(samplingMode, generateMipMaps);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, filters.mag);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, filters.min);
    if (generateMipMaps) {
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_2D, null);
    this._internalTexturesCache.push(texture);
    return texture;
};
Engine.prototype.createRawCubeTexture = function (data, size, format, type, generateMipMaps, invertY, samplingMode, compression) {
    if (compression === void 0) { compression = null; }
    var gl = this._gl;
    var texture = new InternalTexture(this, InternalTexture.DATASOURCE_CUBERAW);
    texture.isCube = true;
    texture.format = format;
    texture.type = type;
    if (!this._doNotHandleContextLost) {
        texture._bufferViewArray = data;
    }
    var textureType = this._getWebGLTextureType(type);
    var internalFormat = this._getInternalFormat(format);
    if (internalFormat === gl.RGB) {
        internalFormat = gl.RGBA;
    }
    // Mipmap generation needs a sized internal format that is both color-renderable and texture-filterable
    if (textureType === gl.FLOAT && !this._caps.textureFloatLinearFiltering) {
        generateMipMaps = false;
        samplingMode = Engine.TEXTURE_NEAREST_SAMPLINGMODE;
        Logger.Warn("Float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.");
    }
    else if (textureType === this._gl.HALF_FLOAT_OES && !this._caps.textureHalfFloatLinearFiltering) {
        generateMipMaps = false;
        samplingMode = Engine.TEXTURE_NEAREST_SAMPLINGMODE;
        Logger.Warn("Half float texture filtering is not supported. Mipmap generation and sampling mode are forced to false and TEXTURE_NEAREST_SAMPLINGMODE, respectively.");
    }
    else if (textureType === gl.FLOAT && !this._caps.textureFloatRender) {
        generateMipMaps = false;
        Logger.Warn("Render to float textures is not supported. Mipmap generation forced to false.");
    }
    else if (textureType === gl.HALF_FLOAT && !this._caps.colorBufferFloat) {
        generateMipMaps = false;
        Logger.Warn("Render to half float textures is not supported. Mipmap generation forced to false.");
    }
    var width = size;
    var height = width;
    texture.width = width;
    texture.height = height;
    // Double check on POT to generate Mips.
    var isPot = !this.needPOTTextures || (Tools.IsExponentOfTwo(texture.width) && Tools.IsExponentOfTwo(texture.height));
    if (!isPot) {
        generateMipMaps = false;
    }
    // Upload data if needed. The texture won't be ready until then.
    if (data) {
        this.updateRawCubeTexture(texture, data, format, type, invertY, compression);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, texture, true);
    // Filters
    if (data && generateMipMaps) {
        this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
    }
    var filters = this._getSamplingParameters(samplingMode, generateMipMaps);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, filters.mag);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, filters.min);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
    texture.generateMipMaps = generateMipMaps;
    return texture;
};
Engine.prototype.updateRawCubeTexture = function (texture, data, format, type, invertY, compression, level) {
    if (compression === void 0) { compression = null; }
    if (level === void 0) { level = 0; }
    texture._bufferViewArray = data;
    texture.format = format;
    texture.type = type;
    texture.invertY = invertY;
    texture._compression = compression;
    var gl = this._gl;
    var textureType = this._getWebGLTextureType(type);
    var internalFormat = this._getInternalFormat(format);
    var internalSizedFomat = this._getRGBABufferInternalSizedFormat(type);
    var needConversion = false;
    if (internalFormat === gl.RGB) {
        internalFormat = gl.RGBA;
        needConversion = true;
    }
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
    this._unpackFlipY(invertY === undefined ? true : (invertY ? true : false));
    if (texture.width % 4 !== 0) {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    }
    // Data are known to be in +X +Y +Z -X -Y -Z
    for (var faceIndex = 0; faceIndex < 6; faceIndex++) {
        var faceData = data[faceIndex];
        if (compression) {
            gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex, level, (this.getCaps().s3tc)[compression], texture.width, texture.height, 0, faceData);
        }
        else {
            if (needConversion) {
                faceData = this._convertRGBtoRGBATextureData(faceData, texture.width, texture.height, type);
            }
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex, level, internalSizedFomat, texture.width, texture.height, 0, internalFormat, textureType, faceData);
        }
    }
    var isPot = !this.needPOTTextures || (Tools.IsExponentOfTwo(texture.width) && Tools.IsExponentOfTwo(texture.height));
    if (isPot && texture.generateMipMaps && level === 0) {
        this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null);
    // this.resetTextureCache();
    texture.isReady = true;
};
Engine.prototype.createRawCubeTextureFromUrl = function (url, scene, size, format, type, noMipmap, callback, mipmapGenerator, onLoad, onError, samplingMode, invertY) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (samplingMode === void 0) { samplingMode = Engine.TEXTURE_TRILINEAR_SAMPLINGMODE; }
    if (invertY === void 0) { invertY = false; }
    var gl = this._gl;
    var texture = this.createRawCubeTexture(null, size, format, type, !noMipmap, invertY, samplingMode);
    scene._addPendingData(texture);
    texture.url = url;
    this._internalTexturesCache.push(texture);
    var onerror = function (request, exception) {
        scene._removePendingData(texture);
        if (onError && request) {
            onError(request.status + " " + request.statusText, exception);
        }
    };
    var internalCallback = function (data) {
        var width = texture.width;
        var faceDataArrays = callback(data);
        if (!faceDataArrays) {
            return;
        }
        if (mipmapGenerator) {
            var textureType = _this._getWebGLTextureType(type);
            var internalFormat = _this._getInternalFormat(format);
            var internalSizedFomat = _this._getRGBABufferInternalSizedFormat(type);
            var needConversion = false;
            if (internalFormat === gl.RGB) {
                internalFormat = gl.RGBA;
                needConversion = true;
            }
            _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
            _this._unpackFlipY(false);
            var mipData = mipmapGenerator(faceDataArrays);
            for (var level = 0; level < mipData.length; level++) {
                var mipSize = width >> level;
                for (var faceIndex = 0; faceIndex < 6; faceIndex++) {
                    var mipFaceData = mipData[level][faceIndex];
                    if (needConversion) {
                        mipFaceData = _this._convertRGBtoRGBATextureData(mipFaceData, mipSize, mipSize, type);
                    }
                    gl.texImage2D(faceIndex, level, internalSizedFomat, mipSize, mipSize, 0, internalFormat, textureType, mipFaceData);
                }
            }
            _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
        }
        else {
            _this.updateRawCubeTexture(texture, faceDataArrays, format, type, invertY);
        }
        texture.isReady = true;
        // this.resetTextureCache();
        scene._removePendingData(texture);
        if (onLoad) {
            onLoad();
        }
    };
    this._loadFile(url, function (data) {
        internalCallback(data);
    }, undefined, scene.offlineProvider, true, onerror);
    return texture;
};
Engine.prototype.createRawTexture3D = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = Engine.TEXTURETYPE_UNSIGNED_INT; }
    var texture = new InternalTexture(this, InternalTexture.DATASOURCE_RAW3D);
    texture.baseWidth = width;
    texture.baseHeight = height;
    texture.baseDepth = depth;
    texture.width = width;
    texture.height = height;
    texture.depth = depth;
    texture.format = format;
    texture.type = textureType;
    texture.generateMipMaps = generateMipMaps;
    texture.samplingMode = samplingMode;
    texture.is3D = true;
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
    }
    this.updateRawTexture3D(texture, data, format, invertY, compression, textureType);
    this._bindTextureDirectly(this._gl.TEXTURE_3D, texture, true);
    // Filters
    var filters = this._getSamplingParameters(samplingMode, generateMipMaps);
    this._gl.texParameteri(this._gl.TEXTURE_3D, this._gl.TEXTURE_MAG_FILTER, filters.mag);
    this._gl.texParameteri(this._gl.TEXTURE_3D, this._gl.TEXTURE_MIN_FILTER, filters.min);
    if (generateMipMaps) {
        this._gl.generateMipmap(this._gl.TEXTURE_3D);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_3D, null);
    this._internalTexturesCache.push(texture);
    return texture;
};
Engine.prototype.updateRawTexture3D = function (texture, data, format, invertY, compression, textureType) {
    if (compression === void 0) { compression = null; }
    if (textureType === void 0) { textureType = Engine.TEXTURETYPE_UNSIGNED_INT; }
    var internalType = this._getWebGLTextureType(textureType);
    var internalFormat = this._getInternalFormat(format);
    var internalSizedFomat = this._getRGBABufferInternalSizedFormat(textureType, format);
    this._bindTextureDirectly(this._gl.TEXTURE_3D, texture, true);
    this._unpackFlipY(invertY === undefined ? true : (invertY ? true : false));
    if (!this._doNotHandleContextLost) {
        texture._bufferView = data;
        texture.format = format;
        texture.invertY = invertY;
        texture._compression = compression;
    }
    if (texture.width % 4 !== 0) {
        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);
    }
    if (compression && data) {
        this._gl.compressedTexImage3D(this._gl.TEXTURE_3D, 0, this.getCaps().s3tc[compression], texture.width, texture.height, texture.depth, 0, data);
    }
    else {
        this._gl.texImage3D(this._gl.TEXTURE_3D, 0, internalSizedFomat, texture.width, texture.height, texture.depth, 0, internalFormat, internalType, data);
    }
    if (texture.generateMipMaps) {
        this._gl.generateMipmap(this._gl.TEXTURE_3D);
    }
    this._bindTextureDirectly(this._gl.TEXTURE_3D, null);
    // this.resetTextureCache();
    texture.isReady = true;
};

/**
 * Raw texture can help creating a texture directly from an array of data.
 * This can be super useful if you either get the data from an uncompressed source or
 * if you wish to create your texture pixel by pixel.
 */
var RawTexture = /** @class */ (function (_super) {
    __extends(RawTexture, _super);
    /**
     * Instantiates a new RawTexture.
     * Raw texture can help creating a texture directly from an array of data.
     * This can be super useful if you either get the data from an uncompressed source or
     * if you wish to create your texture pixel by pixel.
     * @param data define the array of data to use to create the texture
     * @param width define the width of the texture
     * @param height define the height of the texture
     * @param format define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     * @param scene  define the scene the texture belongs to
     * @param generateMipMaps define whether mip maps should be generated or not
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     */
    function RawTexture(data, width, height, 
    /**
     * Define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     */
    format, scene, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = Constants.TEXTURETYPE_UNSIGNED_INT; }
        var _this = _super.call(this, null, scene, !generateMipMaps, invertY) || this;
        _this.format = format;
        _this._engine = scene.getEngine();
        _this._texture = scene.getEngine().createRawTexture(data, width, height, format, generateMipMaps, invertY, samplingMode, null, type);
        _this.wrapU = Texture.CLAMP_ADDRESSMODE;
        _this.wrapV = Texture.CLAMP_ADDRESSMODE;
        return _this;
    }
    /**
     * Updates the texture underlying data.
     * @param data Define the new data of the texture
     */
    RawTexture.prototype.update = function (data) {
        this._engine.updateRawTexture(this._texture, data, this._texture.format, this._texture.invertY, null, this._texture.type);
    };
    /**
     * Creates a luminance texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance texture
     */
    RawTexture.CreateLuminanceTexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_LUMINANCE, scene, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates a luminance alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance alpha texture
     */
    RawTexture.CreateLuminanceAlphaTexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_LUMINANCE_ALPHA, scene, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates an alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the alpha texture
     */
    RawTexture.CreateAlphaTexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_ALPHA, scene, generateMipMaps, invertY, samplingMode);
    };
    /**
     * Creates a RGB texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGB alpha texture
     */
    RawTexture.CreateRGBTexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = Constants.TEXTURETYPE_UNSIGNED_INT; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_RGB, scene, generateMipMaps, invertY, samplingMode, type);
    };
    /**
     * Creates a RGBA texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    RawTexture.CreateRGBATexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = Constants.TEXTURETYPE_UNSIGNED_INT; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_RGBA, scene, generateMipMaps, invertY, samplingMode, type);
    };
    /**
     * Creates a R texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param scene Define the scene the texture belongs to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the R texture
     */
    RawTexture.CreateRTexture = function (data, width, height, scene, generateMipMaps, invertY, samplingMode, type) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (type === void 0) { type = Constants.TEXTURETYPE_FLOAT; }
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_R, scene, generateMipMaps, invertY, samplingMode, type);
    };
    return RawTexture;
}(Texture));

/**
 * Class used to handle skinning animations
 * @see http://doc.babylonjs.com/how_to/how_to_use_bones_and_skeletons
 */
var Skeleton = /** @class */ (function () {
    /**
     * Creates a new skeleton
     * @param name defines the skeleton name
     * @param id defines the skeleton Id
     * @param scene defines the hosting scene
     */
    function Skeleton(
    /** defines the skeleton name */
    name, 
    /** defines the skeleton Id */
    id, scene) {
        this.name = name;
        this.id = id;
        /**
         * Defines the list of child bones
         */
        this.bones = new Array();
        /**
         * Defines a boolean indicating if the root matrix is provided by meshes or by the current skeleton (this is the default value)
         */
        this.needInitialSkinMatrix = false;
        /**
         * Defines a mesh that override the matrix used to get the world matrix (null by default).
         */
        this.overrideMesh = null;
        this._isDirty = true;
        this._meshesWithPoseMatrix = new Array();
        this._identity = Matrix.Identity();
        this._ranges = {};
        this._lastAbsoluteTransformsUpdateId = -1;
        this._canUseTextureForBones = false;
        this._uniqueId = 0;
        /** @hidden */
        this._numBonesWithLinkedTransformNode = 0;
        /** @hidden */
        this._hasWaitingData = null;
        /**
         * Specifies if the skeleton should be serialized
         */
        this.doNotSerialize = false;
        this._useTextureToStoreBoneMatrices = true;
        this._animationPropertiesOverride = null;
        // Events
        /**
         * An observable triggered before computing the skeleton's matrices
         */
        this.onBeforeComputeObservable = new Observable();
        this.bones = [];
        this._scene = scene || EngineStore.LastCreatedScene;
        this._uniqueId = this._scene.getUniqueId();
        this._scene.addSkeleton(this);
        //make sure it will recalculate the matrix next time prepare is called.
        this._isDirty = true;
        var engineCaps = this._scene.getEngine().getCaps();
        this._canUseTextureForBones = engineCaps.textureFloat && engineCaps.maxVertexTextureImageUnits > 0;
    }
    Object.defineProperty(Skeleton.prototype, "useTextureToStoreBoneMatrices", {
        /**
         * Gets or sets a boolean indicating that bone matrices should be stored as a texture instead of using shader uniforms (default is true).
         * Please note that this option is not available when needInitialSkinMatrix === true or if the hardware does not support it
         */
        get: function () {
            return this._useTextureToStoreBoneMatrices;
        },
        set: function (value) {
            this._useTextureToStoreBoneMatrices = value;
            this._markAsDirty();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skeleton.prototype, "animationPropertiesOverride", {
        /**
         * Gets or sets the animation properties override
         */
        get: function () {
            if (!this._animationPropertiesOverride) {
                return this._scene.animationPropertiesOverride;
            }
            return this._animationPropertiesOverride;
        },
        set: function (value) {
            this._animationPropertiesOverride = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skeleton.prototype, "isUsingTextureForMatrices", {
        /**
         * Gets a boolean indicating that the skeleton effectively stores matrices into a texture
         */
        get: function () {
            return this.useTextureToStoreBoneMatrices && this._canUseTextureForBones && !this.needInitialSkinMatrix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Skeleton.prototype, "uniqueId", {
        /**
         * Gets the unique ID of this skeleton
         */
        get: function () {
            return this._uniqueId;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the current object class name.
     * @return the class name
     */
    Skeleton.prototype.getClassName = function () {
        return "Skeleton";
    };
    /**
     * Returns an array containing the root bones
     * @returns an array containing the root bones
     */
    Skeleton.prototype.getChildren = function () {
        return this.bones.filter(function (b) { return !b.getParent(); });
    };
    // Members
    /**
     * Gets the list of transform matrices to send to shaders (one matrix per bone)
     * @param mesh defines the mesh to use to get the root matrix (if needInitialSkinMatrix === true)
     * @returns a Float32Array containing matrices data
     */
    Skeleton.prototype.getTransformMatrices = function (mesh) {
        if (this.needInitialSkinMatrix && mesh._bonesTransformMatrices) {
            return mesh._bonesTransformMatrices;
        }
        if (!this._transformMatrices) {
            this.prepare();
        }
        return this._transformMatrices;
    };
    /**
     * Gets the list of transform matrices to send to shaders inside a texture (one matrix per bone)
     * @returns a raw texture containing the data
     */
    Skeleton.prototype.getTransformMatrixTexture = function () {
        return this._transformMatrixTexture;
    };
    /**
     * Gets the current hosting scene
     * @returns a scene object
     */
    Skeleton.prototype.getScene = function () {
        return this._scene;
    };
    // Methods
    /**
     * Gets a string representing the current skeleton data
     * @param fullDetails defines a boolean indicating if we want a verbose version
     * @returns a string representing the current skeleton data
     */
    Skeleton.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name + ", nBones: " + this.bones.length;
        ret += ", nAnimationRanges: " + (this._ranges ? Object.keys(this._ranges).length : "none");
        if (fullDetails) {
            ret += ", Ranges: {";
            var first = true;
            for (var name_1 in this._ranges) {
                if (first) {
                    ret += ", ";
                    first = false;
                }
                ret += name_1;
            }
            ret += "}";
        }
        return ret;
    };
    /**
    * Get bone's index searching by name
    * @param name defines bone's name to search for
    * @return the indice of the bone. Returns -1 if not found
    */
    Skeleton.prototype.getBoneIndexByName = function (name) {
        for (var boneIndex = 0, cache = this.bones.length; boneIndex < cache; boneIndex++) {
            if (this.bones[boneIndex].name === name) {
                return boneIndex;
            }
        }
        return -1;
    };
    /**
     * Creater a new animation range
     * @param name defines the name of the range
     * @param from defines the start key
     * @param to defines the end key
     */
    Skeleton.prototype.createAnimationRange = function (name, from, to) {
        // check name not already in use
        if (!this._ranges[name]) {
            this._ranges[name] = new AnimationRange(name, from, to);
            for (var i = 0, nBones = this.bones.length; i < nBones; i++) {
                if (this.bones[i].animations[0]) {
                    this.bones[i].animations[0].createRange(name, from, to);
                }
            }
        }
    };
    /**
     * Delete a specific animation range
     * @param name defines the name of the range
     * @param deleteFrames defines if frames must be removed as well
     */
    Skeleton.prototype.deleteAnimationRange = function (name, deleteFrames) {
        if (deleteFrames === void 0) { deleteFrames = true; }
        for (var i = 0, nBones = this.bones.length; i < nBones; i++) {
            if (this.bones[i].animations[0]) {
                this.bones[i].animations[0].deleteRange(name, deleteFrames);
            }
        }
        this._ranges[name] = null; // said much faster than 'delete this._range[name]'
    };
    /**
     * Gets a specific animation range
     * @param name defines the name of the range to look for
     * @returns the requested animation range or null if not found
     */
    Skeleton.prototype.getAnimationRange = function (name) {
        return this._ranges[name];
    };
    /**
     * Gets the list of all animation ranges defined on this skeleton
     * @returns an array
     */
    Skeleton.prototype.getAnimationRanges = function () {
        var animationRanges = [];
        var name;
        for (name in this._ranges) {
            animationRanges.push(this._ranges[name]);
        }
        return animationRanges;
    };
    /**
     * Copy animation range from a source skeleton.
     * This is not for a complete retargeting, only between very similar skeleton's with only possible bone length differences
     * @param source defines the source skeleton
     * @param name defines the name of the range to copy
     * @param rescaleAsRequired defines if rescaling must be applied if required
     * @returns true if operation was successful
     */
    Skeleton.prototype.copyAnimationRange = function (source, name, rescaleAsRequired) {
        if (rescaleAsRequired === void 0) { rescaleAsRequired = false; }
        if (this._ranges[name] || !source.getAnimationRange(name)) {
            return false;
        }
        var ret = true;
        var frameOffset = this._getHighestAnimationFrame() + 1;
        // make a dictionary of source skeleton's bones, so exact same order or doublely nested loop is not required
        var boneDict = {};
        var sourceBones = source.bones;
        var nBones;
        var i;
        for (i = 0, nBones = sourceBones.length; i < nBones; i++) {
            boneDict[sourceBones[i].name] = sourceBones[i];
        }
        if (this.bones.length !== sourceBones.length) {
            Logger.Warn("copyAnimationRange: this rig has " + this.bones.length + " bones, while source as " + sourceBones.length);
            ret = false;
        }
        var skelDimensionsRatio = (rescaleAsRequired && this.dimensionsAtRest && source.dimensionsAtRest) ? this.dimensionsAtRest.divide(source.dimensionsAtRest) : null;
        for (i = 0, nBones = this.bones.length; i < nBones; i++) {
            var boneName = this.bones[i].name;
            var sourceBone = boneDict[boneName];
            if (sourceBone) {
                ret = ret && this.bones[i].copyAnimationRange(sourceBone, name, frameOffset, rescaleAsRequired, skelDimensionsRatio);
            }
            else {
                Logger.Warn("copyAnimationRange: not same rig, missing source bone " + boneName);
                ret = false;
            }
        }
        // do not call createAnimationRange(), since it also is done to bones, which was already done
        var range = source.getAnimationRange(name);
        if (range) {
            this._ranges[name] = new AnimationRange(name, range.from + frameOffset, range.to + frameOffset);
        }
        return ret;
    };
    /**
     * Forces the skeleton to go to rest pose
     */
    Skeleton.prototype.returnToRest = function () {
        for (var index = 0; index < this.bones.length; index++) {
            this.bones[index].returnToRest();
        }
    };
    Skeleton.prototype._getHighestAnimationFrame = function () {
        var ret = 0;
        for (var i = 0, nBones = this.bones.length; i < nBones; i++) {
            if (this.bones[i].animations[0]) {
                var highest = this.bones[i].animations[0].getHighestFrame();
                if (ret < highest) {
                    ret = highest;
                }
            }
        }
        return ret;
    };
    /**
     * Begin a specific animation range
     * @param name defines the name of the range to start
     * @param loop defines if looping must be turned on (false by default)
     * @param speedRatio defines the speed ratio to apply (1 by default)
     * @param onAnimationEnd defines a callback which will be called when animation will end
     * @returns a new animatable
     */
    Skeleton.prototype.beginAnimation = function (name, loop, speedRatio, onAnimationEnd) {
        var range = this.getAnimationRange(name);
        if (!range) {
            return null;
        }
        return this._scene.beginAnimation(this, range.from, range.to, loop, speedRatio, onAnimationEnd);
    };
    /** @hidden */
    Skeleton.prototype._markAsDirty = function () {
        this._isDirty = true;
    };
    /** @hidden */
    Skeleton.prototype._registerMeshWithPoseMatrix = function (mesh) {
        this._meshesWithPoseMatrix.push(mesh);
    };
    /** @hidden */
    Skeleton.prototype._unregisterMeshWithPoseMatrix = function (mesh) {
        var index = this._meshesWithPoseMatrix.indexOf(mesh);
        if (index > -1) {
            this._meshesWithPoseMatrix.splice(index, 1);
        }
    };
    Skeleton.prototype._computeTransformMatrices = function (targetMatrix, initialSkinMatrix) {
        this.onBeforeComputeObservable.notifyObservers(this);
        for (var index = 0; index < this.bones.length; index++) {
            var bone = this.bones[index];
            bone._childUpdateId++;
            var parentBone = bone.getParent();
            if (parentBone) {
                bone.getLocalMatrix().multiplyToRef(parentBone.getWorldMatrix(), bone.getWorldMatrix());
            }
            else {
                if (initialSkinMatrix) {
                    bone.getLocalMatrix().multiplyToRef(initialSkinMatrix, bone.getWorldMatrix());
                }
                else {
                    bone.getWorldMatrix().copyFrom(bone.getLocalMatrix());
                }
            }
            if (bone._index !== -1) {
                var mappedIndex = bone._index === null ? index : bone._index;
                bone.getInvertedAbsoluteTransform().multiplyToArray(bone.getWorldMatrix(), targetMatrix, mappedIndex * 16);
            }
        }
        this._identity.copyToArray(targetMatrix, this.bones.length * 16);
    };
    /**
     * Build all resources required to render a skeleton
     */
    Skeleton.prototype.prepare = function () {
        // Update the local matrix of bones with linked transform nodes.
        if (this._numBonesWithLinkedTransformNode > 0) {
            for (var _i = 0, _a = this.bones; _i < _a.length; _i++) {
                var bone_1 = _a[_i];
                if (bone_1._linkedTransformNode) {
                    // Computing the world matrix also computes the local matrix.
                    bone_1._linkedTransformNode.computeWorldMatrix();
                    bone_1._matrix = bone_1._linkedTransformNode._localMatrix;
                    bone_1.markAsDirty();
                }
            }
        }
        if (!this._isDirty) {
            return;
        }
        if (this.needInitialSkinMatrix) {
            for (var index = 0; index < this._meshesWithPoseMatrix.length; index++) {
                var mesh = this._meshesWithPoseMatrix[index];
                var poseMatrix = mesh.getPoseMatrix();
                if (!mesh._bonesTransformMatrices || mesh._bonesTransformMatrices.length !== 16 * (this.bones.length + 1)) {
                    mesh._bonesTransformMatrices = new Float32Array(16 * (this.bones.length + 1));
                }
                if (this._synchronizedWithMesh !== mesh) {
                    this._synchronizedWithMesh = mesh;
                    // Prepare bones
                    for (var boneIndex = 0; boneIndex < this.bones.length; boneIndex++) {
                        var bone = this.bones[boneIndex];
                        if (!bone.getParent()) {
                            var matrix = bone.getBaseMatrix();
                            matrix.multiplyToRef(poseMatrix, Tmp.Matrix[1]);
                            bone._updateDifferenceMatrix(Tmp.Matrix[1]);
                        }
                    }
                }
                this._computeTransformMatrices(mesh._bonesTransformMatrices, poseMatrix);
            }
        }
        else {
            if (!this._transformMatrices || this._transformMatrices.length !== 16 * (this.bones.length + 1)) {
                this._transformMatrices = new Float32Array(16 * (this.bones.length + 1));
                if (this.isUsingTextureForMatrices) {
                    if (this._transformMatrixTexture) {
                        this._transformMatrixTexture.dispose();
                    }
                    this._transformMatrixTexture = RawTexture.CreateRGBATexture(this._transformMatrices, (this.bones.length + 1) * 4, 1, this._scene, false, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE, Constants.TEXTURETYPE_FLOAT);
                }
            }
            this._computeTransformMatrices(this._transformMatrices, null);
            if (this.isUsingTextureForMatrices && this._transformMatrixTexture) {
                this._transformMatrixTexture.update(this._transformMatrices);
            }
        }
        this._isDirty = false;
        this._scene._activeBones.addCount(this.bones.length, false);
    };
    /**
     * Gets the list of animatables currently running for this skeleton
     * @returns an array of animatables
     */
    Skeleton.prototype.getAnimatables = function () {
        if (!this._animatables || this._animatables.length !== this.bones.length) {
            this._animatables = [];
            for (var index = 0; index < this.bones.length; index++) {
                this._animatables.push(this.bones[index]);
            }
        }
        return this._animatables;
    };
    /**
     * Clone the current skeleton
     * @param name defines the name of the new skeleton
     * @param id defines the id of the new skeleton
     * @returns the new skeleton
     */
    Skeleton.prototype.clone = function (name, id) {
        var result = new Skeleton(name, id || name, this._scene);
        result.needInitialSkinMatrix = this.needInitialSkinMatrix;
        for (var index = 0; index < this.bones.length; index++) {
            var source = this.bones[index];
            var parentBone = null;
            var parent_1 = source.getParent();
            if (parent_1) {
                var parentIndex = this.bones.indexOf(parent_1);
                parentBone = result.bones[parentIndex];
            }
            var bone = new Bone(source.name, result, parentBone, source.getBaseMatrix().clone(), source.getRestPose().clone());
            DeepCopier.DeepCopy(source.animations, bone.animations);
        }
        if (this._ranges) {
            result._ranges = {};
            for (var rangeName in this._ranges) {
                var range = this._ranges[rangeName];
                if (range) {
                    result._ranges[rangeName] = range.clone();
                }
            }
        }
        this._isDirty = true;
        return result;
    };
    /**
     * Enable animation blending for this skeleton
     * @param blendingSpeed defines the blending speed to apply
     * @see http://doc.babylonjs.com/babylon101/animations#animation-blending
     */
    Skeleton.prototype.enableBlending = function (blendingSpeed) {
        if (blendingSpeed === void 0) { blendingSpeed = 0.01; }
        this.bones.forEach(function (bone) {
            bone.animations.forEach(function (animation) {
                animation.enableBlending = true;
                animation.blendingSpeed = blendingSpeed;
            });
        });
    };
    /**
     * Releases all resources associated with the current skeleton
     */
    Skeleton.prototype.dispose = function () {
        this._meshesWithPoseMatrix = [];
        // Animations
        this.getScene().stopAnimation(this);
        // Remove from scene
        this.getScene().removeSkeleton(this);
        if (this._transformMatrixTexture) {
            this._transformMatrixTexture.dispose();
            this._transformMatrixTexture = null;
        }
    };
    /**
     * Serialize the skeleton in a JSON object
     * @returns a JSON object
     */
    Skeleton.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.id = this.id;
        if (this.dimensionsAtRest) {
            serializationObject.dimensionsAtRest = this.dimensionsAtRest.asArray();
        }
        serializationObject.bones = [];
        serializationObject.needInitialSkinMatrix = this.needInitialSkinMatrix;
        for (var index = 0; index < this.bones.length; index++) {
            var bone = this.bones[index];
            var parent_2 = bone.getParent();
            var serializedBone = {
                parentBoneIndex: parent_2 ? this.bones.indexOf(parent_2) : -1,
                name: bone.name,
                matrix: bone.getBaseMatrix().toArray(),
                rest: bone.getRestPose().toArray()
            };
            serializationObject.bones.push(serializedBone);
            if (bone.length) {
                serializedBone.length = bone.length;
            }
            if (bone.metadata) {
                serializedBone.metadata = bone.metadata;
            }
            if (bone.animations && bone.animations.length > 0) {
                serializedBone.animation = bone.animations[0].serialize();
            }
            serializationObject.ranges = [];
            for (var name in this._ranges) {
                var source = this._ranges[name];
                if (!source) {
                    continue;
                }
                var range = {};
                range.name = name;
                range.from = source.from;
                range.to = source.to;
                serializationObject.ranges.push(range);
            }
        }
        return serializationObject;
    };
    /**
     * Creates a new skeleton from serialized data
     * @param parsedSkeleton defines the serialized data
     * @param scene defines the hosting scene
     * @returns a new skeleton
     */
    Skeleton.Parse = function (parsedSkeleton, scene) {
        var skeleton = new Skeleton(parsedSkeleton.name, parsedSkeleton.id, scene);
        if (parsedSkeleton.dimensionsAtRest) {
            skeleton.dimensionsAtRest = Vector3.FromArray(parsedSkeleton.dimensionsAtRest);
        }
        skeleton.needInitialSkinMatrix = parsedSkeleton.needInitialSkinMatrix;
        var index;
        for (index = 0; index < parsedSkeleton.bones.length; index++) {
            var parsedBone = parsedSkeleton.bones[index];
            var parentBone = null;
            if (parsedBone.parentBoneIndex > -1) {
                parentBone = skeleton.bones[parsedBone.parentBoneIndex];
            }
            var rest = parsedBone.rest ? Matrix.FromArray(parsedBone.rest) : null;
            var bone = new Bone(parsedBone.name, skeleton, parentBone, Matrix.FromArray(parsedBone.matrix), rest);
            if (parsedBone.id !== undefined && parsedBone.id !== null) {
                bone.id = parsedBone.id;
            }
            if (parsedBone.length) {
                bone.length = parsedBone.length;
            }
            if (parsedBone.metadata) {
                bone.metadata = parsedBone.metadata;
            }
            if (parsedBone.animation) {
                bone.animations.push(Animation.Parse(parsedBone.animation));
            }
            if (parsedBone.linkedTransformNodeId !== undefined && parsedBone.linkedTransformNodeId !== null) {
                skeleton._hasWaitingData = true;
                bone._waitingTransformNodeId = parsedBone.linkedTransformNodeId;
            }
        }
        // placed after bones, so createAnimationRange can cascade down
        if (parsedSkeleton.ranges) {
            for (index = 0; index < parsedSkeleton.ranges.length; index++) {
                var data = parsedSkeleton.ranges[index];
                skeleton.createAnimationRange(data.name, data.from, data.to);
            }
        }
        return skeleton;
    };
    /**
     * Compute all node absolute transforms
     * @param forceUpdate defines if computation must be done even if cache is up to date
     */
    Skeleton.prototype.computeAbsoluteTransforms = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        var renderId = this._scene.getRenderId();
        if (this._lastAbsoluteTransformsUpdateId != renderId || forceUpdate) {
            this.bones[0].computeAbsoluteTransforms();
            this._lastAbsoluteTransformsUpdateId = renderId;
        }
    };
    /**
     * Gets the root pose matrix
     * @returns a matrix
     */
    Skeleton.prototype.getPoseMatrix = function () {
        var poseMatrix = null;
        if (this._meshesWithPoseMatrix.length > 0) {
            poseMatrix = this._meshesWithPoseMatrix[0].getPoseMatrix();
        }
        return poseMatrix;
    };
    /**
     * Sorts bones per internal index
     */
    Skeleton.prototype.sortBones = function () {
        var bones = new Array();
        var visited = new Array(this.bones.length);
        for (var index = 0; index < this.bones.length; index++) {
            this._sortBones(index, bones, visited);
        }
        this.bones = bones;
    };
    Skeleton.prototype._sortBones = function (index, bones, visited) {
        if (visited[index]) {
            return;
        }
        visited[index] = true;
        var bone = this.bones[index];
        if (bone._index === undefined) {
            bone._index = index;
        }
        var parentBone = bone.getParent();
        if (parentBone) {
            this._sortBones(this.bones.indexOf(parentBone), bones, visited);
        }
        bones.push(bone);
    };
    return Skeleton;
}());

/**
 * @ignore
 * This is a list of all the different input types that are available in the application.
 * Fo instance: ArcRotateCameraGamepadInput...
 */
var CameraInputTypes = {};
/**
 * This represents the input manager used within a camera.
 * It helps dealing with all the different kind of input attached to a camera.
 * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var CameraInputsManager = /** @class */ (function () {
    /**
     * Instantiate a new Camera Input Manager.
     * @param camera Defines the camera the input manager blongs to
     */
    function CameraInputsManager(camera) {
        this.attached = {};
        this.camera = camera;
        this.checkInputs = function () { };
    }
    /**
     * Add an input method to a camera
     * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
     * @param input camera input method
     */
    CameraInputsManager.prototype.add = function (input) {
        var type = input.getSimpleName();
        if (this.attached[type]) {
            Logger.Warn("camera input of type " + type + " already exists on camera");
            return;
        }
        this.attached[type] = input;
        input.camera = this.camera;
        //for checkInputs, we are dynamically creating a function
        //the goal is to avoid the performance penalty of looping for inputs in the render loop
        if (input.checkInputs) {
            this.checkInputs = this._addCheckInputs(input.checkInputs.bind(input));
        }
        if (this.attachedElement) {
            input.attachControl(this.attachedElement);
        }
    };
    /**
     * Remove a specific input method from a camera
     * example: camera.inputs.remove(camera.inputs.attached.mouse);
     * @param inputToRemove camera input method
     */
    CameraInputsManager.prototype.remove = function (inputToRemove) {
        for (var cam in this.attached) {
            var input = this.attached[cam];
            if (input === inputToRemove) {
                input.detachControl(this.attachedElement);
                input.camera = null;
                delete this.attached[cam];
                this.rebuildInputCheck();
            }
        }
    };
    /**
     * Remove a specific input type from a camera
     * example: camera.inputs.remove("ArcRotateCameraGamepadInput");
     * @param inputType the type of the input to remove
     */
    CameraInputsManager.prototype.removeByType = function (inputType) {
        for (var cam in this.attached) {
            var input = this.attached[cam];
            if (input.getClassName() === inputType) {
                input.detachControl(this.attachedElement);
                input.camera = null;
                delete this.attached[cam];
                this.rebuildInputCheck();
            }
        }
    };
    CameraInputsManager.prototype._addCheckInputs = function (fn) {
        var current = this.checkInputs;
        return function () {
            current();
            fn();
        };
    };
    /**
     * Attach the input controls to the currently attached dom element to listen the events from.
     * @param input Defines the input to attach
     */
    CameraInputsManager.prototype.attachInput = function (input) {
        if (this.attachedElement) {
            input.attachControl(this.attachedElement, this.noPreventDefault);
        }
    };
    /**
     * Attach the current manager inputs controls to a specific dom element to listen the events from.
     * @param element Defines the dom element to collect the events from
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    CameraInputsManager.prototype.attachElement = function (element, noPreventDefault) {
        if (noPreventDefault === void 0) { noPreventDefault = false; }
        if (this.attachedElement) {
            return;
        }
        noPreventDefault = Camera.ForceAttachControlToAlwaysPreventDefault ? false : noPreventDefault;
        this.attachedElement = element;
        this.noPreventDefault = noPreventDefault;
        for (var cam in this.attached) {
            this.attached[cam].attachControl(element, noPreventDefault);
        }
    };
    /**
     * Detach the current manager inputs controls from a specific dom element.
     * @param element Defines the dom element to collect the events from
     * @param disconnect Defines whether the input should be removed from the current list of attached inputs
     */
    CameraInputsManager.prototype.detachElement = function (element, disconnect) {
        if (disconnect === void 0) { disconnect = false; }
        if (this.attachedElement !== element) {
            return;
        }
        for (var cam in this.attached) {
            this.attached[cam].detachControl(element);
            if (disconnect) {
                this.attached[cam].camera = null;
            }
        }
        this.attachedElement = null;
    };
    /**
     * Rebuild the dynamic inputCheck function from the current list of
     * defined inputs in the manager.
     */
    CameraInputsManager.prototype.rebuildInputCheck = function () {
        this.checkInputs = function () { };
        for (var cam in this.attached) {
            var input = this.attached[cam];
            if (input.checkInputs) {
                this.checkInputs = this._addCheckInputs(input.checkInputs.bind(input));
            }
        }
    };
    /**
     * Remove all attached input methods from a camera
     */
    CameraInputsManager.prototype.clear = function () {
        if (this.attachedElement) {
            this.detachElement(this.attachedElement, true);
        }
        this.attached = {};
        this.attachedElement = null;
        this.checkInputs = function () { };
    };
    /**
     * Serialize the current input manager attached to a camera.
     * This ensures than once parsed,
     * the input associated to the camera will be identical to the current ones
     * @param serializedCamera Defines the camera serialization JSON the input serialization should write to
     */
    CameraInputsManager.prototype.serialize = function (serializedCamera) {
        var inputs = {};
        for (var cam in this.attached) {
            var input = this.attached[cam];
            var res = SerializationHelper.Serialize(input);
            inputs[input.getClassName()] = res;
        }
        serializedCamera.inputsmgr = inputs;
    };
    /**
     * Parses an input manager serialized JSON to restore the previous list of inputs
     * and states associated to a camera.
     * @param parsedCamera Defines the JSON to parse
     */
    CameraInputsManager.prototype.parse = function (parsedCamera) {
        var parsedInputs = parsedCamera.inputsmgr;
        if (parsedInputs) {
            this.clear();
            for (var n in parsedInputs) {
                var construct = CameraInputTypes[n];
                if (construct) {
                    var parsedinput = parsedInputs[n];
                    var input = SerializationHelper.Parse(function () { return new construct(); }, parsedinput, null);
                    this.add(input);
                }
            }
        }
        else {
            //2016-03-08 this part is for managing backward compatibility
            for (var n in this.attached) {
                var construct = CameraInputTypes[this.attached[n].getClassName()];
                if (construct) {
                    var input = SerializationHelper.Parse(function () { return new construct(); }, parsedCamera, null);
                    this.remove(this.attached[n]);
                    this.add(input);
                }
            }
        }
    };
    return CameraInputsManager;
}());

/**
 * Manage the keyboard inputs to control the movement of a free camera.
 * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraKeyboardMoveInput = /** @class */ (function () {
    function FreeCameraKeyboardMoveInput() {
        /**
         * Gets or Set the list of keyboard keys used to control the forward move of the camera.
         */
        this.keysUp = [38];
        /**
         * Gets or Set the list of keyboard keys used to control the backward move of the camera.
         */
        this.keysDown = [40];
        /**
         * Gets or Set the list of keyboard keys used to control the left strafe move of the camera.
         */
        this.keysLeft = [37];
        /**
         * Gets or Set the list of keyboard keys used to control the right strafe move of the camera.
         */
        this.keysRight = [39];
        this._keys = new Array();
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param element Defines the element the controls should be listened from
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraKeyboardMoveInput.prototype.attachControl = function (element, noPreventDefault) {
        var _this = this;
        if (this._onCanvasBlurObserver) {
            return;
        }
        this._scene = this.camera.getScene();
        this._engine = this._scene.getEngine();
        this._onCanvasBlurObserver = this._engine.onCanvasBlurObservable.add(function () {
            _this._keys = [];
        });
        this._onKeyboardObserver = this._scene.onKeyboardObservable.add(function (info) {
            var evt = info.event;
            if (!evt.metaKey) {
                if (info.type === KeyboardEventTypes.KEYDOWN) {
                    if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1) {
                        var index = _this._keys.indexOf(evt.keyCode);
                        if (index === -1) {
                            _this._keys.push(evt.keyCode);
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
                else {
                    if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1) {
                        var index = _this._keys.indexOf(evt.keyCode);
                        if (index >= 0) {
                            _this._keys.splice(index, 1);
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
            }
        });
    };
    /**
     * Detach the current controls from the specified dom element.
     * @param element Defines the element to stop listening the inputs from
     */
    FreeCameraKeyboardMoveInput.prototype.detachControl = function (element) {
        if (this._scene) {
            if (this._onKeyboardObserver) {
                this._scene.onKeyboardObservable.remove(this._onKeyboardObserver);
            }
            if (this._onCanvasBlurObserver) {
                this._engine.onCanvasBlurObservable.remove(this._onCanvasBlurObserver);
            }
            this._onKeyboardObserver = null;
            this._onCanvasBlurObserver = null;
        }
        this._keys = [];
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    FreeCameraKeyboardMoveInput.prototype.checkInputs = function () {
        if (this._onKeyboardObserver) {
            var camera = this.camera;
            // Keyboard
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                var speed = camera._computeLocalCameraSpeed();
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(-speed, 0, 0);
                }
                else if (this.keysUp.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, speed);
                }
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(speed, 0, 0);
                }
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    camera._localDirection.copyFromFloats(0, 0, -speed);
                }
                if (camera.getScene().useRightHandedSystem) {
                    camera._localDirection.z *= -1;
                }
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
                Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
                camera.cameraDirection.addInPlace(camera._transformedDirection);
            }
        }
    };
    /**
     * Gets the class name of the current intput.
     * @returns the class name
     */
    FreeCameraKeyboardMoveInput.prototype.getClassName = function () {
        return "FreeCameraKeyboardMoveInput";
    };
    /** @hidden */
    FreeCameraKeyboardMoveInput.prototype._onLostFocus = function () {
        this._keys = [];
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraKeyboardMoveInput.prototype.getSimpleName = function () {
        return "keyboard";
    };
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysUp", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysDown", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysLeft", void 0);
    __decorate([
        serialize()
    ], FreeCameraKeyboardMoveInput.prototype, "keysRight", void 0);
    return FreeCameraKeyboardMoveInput;
}());
CameraInputTypes["FreeCameraKeyboardMoveInput"] = FreeCameraKeyboardMoveInput;

/**
 * Manage the mouse inputs to control the movement of a free camera.
 * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraMouseInput = /** @class */ (function () {
    /**
     * Manage the mouse inputs to control the movement of a free camera.
     * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
     * @param touchEnabled Defines if touch is enabled or not
     */
    function FreeCameraMouseInput(
    /**
     * Define if touch is enabled in the mouse input
     */
    touchEnabled) {
        if (touchEnabled === void 0) { touchEnabled = true; }
        this.touchEnabled = touchEnabled;
        /**
         * Defines the buttons associated with the input to handle camera move.
         */
        this.buttons = [0, 1, 2];
        /**
         * Defines the pointer angular sensibility  along the X and Y axis or how fast is the camera rotating.
         */
        this.angularSensibility = 2000.0;
        this.previousPosition = null;
        /**
         * Observable for when a pointer move event occurs containing the move offset
         */
        this.onPointerMovedObservable = new Observable();
        /**
         * @hidden
         * If the camera should be rotated automatically based on pointer movement
         */
        this._allowCameraRotation = true;
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param element Defines the element the controls should be listened from
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraMouseInput.prototype.attachControl = function (element, noPreventDefault) {
        var _this = this;
        var engine = this.camera.getEngine();
        if (!this._pointerInput) {
            this._pointerInput = function (p) {
                var evt = p.event;
                if (engine.isInVRExclusivePointerMode) {
                    return;
                }
                if (!_this.touchEnabled && evt.pointerType === "touch") {
                    return;
                }
                if (p.type !== PointerEventTypes.POINTERMOVE && _this.buttons.indexOf(evt.button) === -1) {
                    return;
                }
                var srcElement = (evt.srcElement || evt.target);
                if (p.type === PointerEventTypes.POINTERDOWN && srcElement) {
                    try {
                        srcElement.setPointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error. Execution will continue.
                    }
                    _this.previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY
                    };
                    if (!noPreventDefault) {
                        evt.preventDefault();
                        element.focus();
                    }
                }
                else if (p.type === PointerEventTypes.POINTERUP && srcElement) {
                    try {
                        srcElement.releasePointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error.
                    }
                    _this.previousPosition = null;
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
                else if (p.type === PointerEventTypes.POINTERMOVE) {
                    if (!_this.previousPosition || engine.isPointerLock) {
                        return;
                    }
                    var offsetX = evt.clientX - _this.previousPosition.x;
                    var offsetY = evt.clientY - _this.previousPosition.y;
                    if (_this.camera.getScene().useRightHandedSystem) {
                        offsetX *= -1;
                    }
                    if (_this.camera.parent && _this.camera.parent._getWorldMatrixDeterminant() < 0) {
                        offsetX *= -1;
                    }
                    if (_this._allowCameraRotation) {
                        _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
                        _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
                    }
                    _this.onPointerMovedObservable.notifyObservers({ offsetX: offsetX, offsetY: offsetY });
                    _this.previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY
                    };
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
        }
        this._onMouseMove = function (evt) {
            if (!engine.isPointerLock) {
                return;
            }
            if (engine.isInVRExclusivePointerMode) {
                return;
            }
            var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
            if (_this.camera.getScene().useRightHandedSystem) {
                offsetX *= -1;
            }
            if (_this.camera.parent && _this.camera.parent._getWorldMatrixDeterminant() < 0) {
                offsetX *= -1;
            }
            _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
            var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
            _this.previousPosition = null;
            if (!noPreventDefault) {
                evt.preventDefault();
            }
        };
        this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
        element.addEventListener("mousemove", this._onMouseMove, false);
        element.addEventListener("contextmenu", this.onContextMenu.bind(this), false);
    };
    /**
     * Called on JS contextmenu event.
     * Override this method to provide functionality.
     */
    FreeCameraMouseInput.prototype.onContextMenu = function (evt) {
        evt.preventDefault();
    };
    /**
     * Detach the current controls from the specified dom element.
     * @param element Defines the element to stop listening the inputs from
     */
    FreeCameraMouseInput.prototype.detachControl = function (element) {
        if (this._observer && element) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            if (this._onMouseMove) {
                element.removeEventListener("mousemove", this._onMouseMove);
            }
            if (this.onContextMenu) {
                element.removeEventListener("contextmenu", this.onContextMenu);
            }
            if (this.onPointerMovedObservable) {
                this.onPointerMovedObservable.clear();
            }
            this._observer = null;
            this._onMouseMove = null;
            this.previousPosition = null;
        }
    };
    /**
     * Gets the class name of the current intput.
     * @returns the class name
     */
    FreeCameraMouseInput.prototype.getClassName = function () {
        return "FreeCameraMouseInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraMouseInput.prototype.getSimpleName = function () {
        return "mouse";
    };
    __decorate([
        serialize()
    ], FreeCameraMouseInput.prototype, "buttons", void 0);
    __decorate([
        serialize()
    ], FreeCameraMouseInput.prototype, "angularSensibility", void 0);
    return FreeCameraMouseInput;
}());
CameraInputTypes["FreeCameraMouseInput"] = FreeCameraMouseInput;

/**
 * Manage the touch inputs to control the movement of a free camera.
 * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraTouchInput = /** @class */ (function () {
    function FreeCameraTouchInput() {
        /**
         * Defines the touch sensibility for rotation.
         * The higher the faster.
         */
        this.touchAngularSensibility = 200000.0;
        /**
         * Defines the touch sensibility for move.
         * The higher the faster.
         */
        this.touchMoveSensibility = 250.0;
        this._offsetX = null;
        this._offsetY = null;
        this._pointerPressed = new Array();
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param element Defines the element the controls should be listened from
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraTouchInput.prototype.attachControl = function (element, noPreventDefault) {
        var _this = this;
        var previousPosition = null;
        if (this._pointerInput === undefined) {
            this._onLostFocus = function () {
                _this._offsetX = null;
                _this._offsetY = null;
            };
            this._pointerInput = function (p) {
                var evt = p.event;
                if (evt.pointerType === "mouse") {
                    return;
                }
                if (p.type === PointerEventTypes.POINTERDOWN) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    _this._pointerPressed.push(evt.pointerId);
                    if (_this._pointerPressed.length !== 1) {
                        return;
                    }
                    previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY
                    };
                }
                else if (p.type === PointerEventTypes.POINTERUP) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    var index = _this._pointerPressed.indexOf(evt.pointerId);
                    if (index === -1) {
                        return;
                    }
                    _this._pointerPressed.splice(index, 1);
                    if (index != 0) {
                        return;
                    }
                    previousPosition = null;
                    _this._offsetX = null;
                    _this._offsetY = null;
                }
                else if (p.type === PointerEventTypes.POINTERMOVE) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    if (!previousPosition) {
                        return;
                    }
                    var index = _this._pointerPressed.indexOf(evt.pointerId);
                    if (index != 0) {
                        return;
                    }
                    _this._offsetX = evt.clientX - previousPosition.x;
                    _this._offsetY = -(evt.clientY - previousPosition.y);
                }
            };
        }
        this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
        if (this._onLostFocus) {
            element.addEventListener("blur", this._onLostFocus);
        }
    };
    /**
     * Detach the current controls from the specified dom element.
     * @param element Defines the element to stop listening the inputs from
     */
    FreeCameraTouchInput.prototype.detachControl = function (element) {
        if (this._pointerInput && element) {
            if (this._observer) {
                this.camera.getScene().onPointerObservable.remove(this._observer);
                this._observer = null;
            }
            if (this._onLostFocus) {
                element.removeEventListener("blur", this._onLostFocus);
                this._onLostFocus = null;
            }
            this._pointerPressed = [];
            this._offsetX = null;
            this._offsetY = null;
        }
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    FreeCameraTouchInput.prototype.checkInputs = function () {
        if (this._offsetX && this._offsetY) {
            var camera = this.camera;
            camera.cameraRotation.y += this._offsetX / this.touchAngularSensibility;
            if (this._pointerPressed.length > 1) {
                camera.cameraRotation.x += -this._offsetY / this.touchAngularSensibility;
            }
            else {
                var speed = camera._computeLocalCameraSpeed();
                var direction = new Vector3(0, 0, speed * this._offsetY / this.touchMoveSensibility);
                Matrix.RotationYawPitchRollToRef(camera.rotation.y, camera.rotation.x, 0, camera._cameraRotationMatrix);
                camera.cameraDirection.addInPlace(Vector3.TransformCoordinates(direction, camera._cameraRotationMatrix));
            }
        }
    };
    /**
     * Gets the class name of the current intput.
     * @returns the class name
     */
    FreeCameraTouchInput.prototype.getClassName = function () {
        return "FreeCameraTouchInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraTouchInput.prototype.getSimpleName = function () {
        return "touch";
    };
    __decorate([
        serialize()
    ], FreeCameraTouchInput.prototype, "touchAngularSensibility", void 0);
    __decorate([
        serialize()
    ], FreeCameraTouchInput.prototype, "touchMoveSensibility", void 0);
    return FreeCameraTouchInput;
}());
CameraInputTypes["FreeCameraTouchInput"] = FreeCameraTouchInput;

/**
 * Default Inputs manager for the FreeCamera.
 * It groups all the default supported inputs for ease of use.
 * @see http://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraInputsManager = /** @class */ (function (_super) {
    __extends(FreeCameraInputsManager, _super);
    /**
     * Instantiates a new FreeCameraInputsManager.
     * @param camera Defines the camera the inputs belong to
     */
    function FreeCameraInputsManager(camera) {
        var _this = _super.call(this, camera) || this;
        /**
         * @hidden
         */
        _this._mouseInput = null;
        return _this;
    }
    /**
     * Add keyboard input support to the input manager.
     * @returns the current input manager
     */
    FreeCameraInputsManager.prototype.addKeyboard = function () {
        this.add(new FreeCameraKeyboardMoveInput());
        return this;
    };
    /**
     * Add mouse input support to the input manager.
     * @param touchEnabled if the FreeCameraMouseInput should support touch (default: true)
     * @returns the current input manager
     */
    FreeCameraInputsManager.prototype.addMouse = function (touchEnabled) {
        if (touchEnabled === void 0) { touchEnabled = true; }
        if (!this._mouseInput) {
            this._mouseInput = new FreeCameraMouseInput(touchEnabled);
            this.add(this._mouseInput);
        }
        return this;
    };
    /**
     * Removes the mouse input support from the manager
     * @returns the current input manager
     */
    FreeCameraInputsManager.prototype.removeMouse = function () {
        if (this._mouseInput) {
            this.remove(this._mouseInput);
        }
        return this;
    };
    /**
     * Add touch input support to the input manager.
     * @returns the current input manager
     */
    FreeCameraInputsManager.prototype.addTouch = function () {
        this.add(new FreeCameraTouchInput());
        return this;
    };
    /**
     * Remove all attached input methods from a camera
     */
    FreeCameraInputsManager.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this._mouseInput = null;
    };
    return FreeCameraInputsManager;
}(CameraInputsManager));

/**
 * A target camera takes a mesh or position as a target and continues to look at it while it moves.
 * This is the base of the follow, arc rotate cameras and Free camera
 * @see http://doc.babylonjs.com/features/cameras
 */
var TargetCamera = /** @class */ (function (_super) {
    __extends(TargetCamera, _super);
    /**
     * Instantiates a target camera that takes a meshor position as a target and continues to look at it while it moves.
     * This is the base of the follow, arc rotate cameras and Free camera
     * @see http://doc.babylonjs.com/features/cameras
     * @param name Defines the name of the camera in the scene
     * @param position Defines the start position of the camera in the scene
     * @param scene Defines the scene the camera belongs to
     * @param setActiveOnSceneIfNoneActive Defines wheter the camera should be marked as active if not other active cameras have been defined
     */
    function TargetCamera(name, position, scene, setActiveOnSceneIfNoneActive) {
        if (setActiveOnSceneIfNoneActive === void 0) { setActiveOnSceneIfNoneActive = true; }
        var _this = _super.call(this, name, position, scene, setActiveOnSceneIfNoneActive) || this;
        /**
         * Define the current direction the camera is moving to
         */
        _this.cameraDirection = new Vector3(0, 0, 0);
        /**
         * Define the current rotation the camera is rotating to
         */
        _this.cameraRotation = new Vector2(0, 0);
        /**
         * When set, the up vector of the camera will be updated by the rotation of the camera
         */
        _this.updateUpVectorFromRotation = false;
        _this._tmpQuaternion = new Quaternion();
        /**
         * Define the current rotation of the camera
         */
        _this.rotation = new Vector3(0, 0, 0);
        /**
         * Define the current speed of the camera
         */
        _this.speed = 2.0;
        /**
         * Add cconstraint to the camera to prevent it to move freely in all directions and
         * around all axis.
         */
        _this.noRotationConstraint = false;
        /**
         * Define the current target of the camera as an object or a position.
         */
        _this.lockedTarget = null;
        /** @hidden */
        _this._currentTarget = Vector3.Zero();
        /** @hidden */
        _this._initialFocalDistance = 1;
        /** @hidden */
        _this._viewMatrix = Matrix.Zero();
        /** @hidden */
        _this._camMatrix = Matrix.Zero();
        /** @hidden */
        _this._cameraTransformMatrix = Matrix.Zero();
        /** @hidden */
        _this._cameraRotationMatrix = Matrix.Zero();
        /** @hidden */
        _this._referencePoint = new Vector3(0, 0, 1);
        /** @hidden */
        _this._transformedReferencePoint = Vector3.Zero();
        _this._globalCurrentTarget = Vector3.Zero();
        _this._globalCurrentUpVector = Vector3.Zero();
        _this._defaultUp = Vector3.Up();
        _this._cachedRotationZ = 0;
        _this._cachedQuaternionRotationZ = 0;
        return _this;
    }
    /**
     * Gets the position in front of the camera at a given distance.
     * @param distance The distance from the camera we want the position to be
     * @returns the position
     */
    TargetCamera.prototype.getFrontPosition = function (distance) {
        this.getWorldMatrix();
        var direction = this.getTarget().subtract(this.position);
        direction.normalize();
        direction.scaleInPlace(distance);
        return this.globalPosition.add(direction);
    };
    /** @hidden */
    TargetCamera.prototype._getLockedTargetPosition = function () {
        if (!this.lockedTarget) {
            return null;
        }
        if (this.lockedTarget.absolutePosition) {
            this.lockedTarget.computeWorldMatrix();
        }
        return this.lockedTarget.absolutePosition || this.lockedTarget;
    };
    /**
     * Store current camera state of the camera (fov, position, rotation, etc..)
     * @returns the camera
     */
    TargetCamera.prototype.storeState = function () {
        this._storedPosition = this.position.clone();
        this._storedRotation = this.rotation.clone();
        if (this.rotationQuaternion) {
            this._storedRotationQuaternion = this.rotationQuaternion.clone();
        }
        return _super.prototype.storeState.call(this);
    };
    /**
     * Restored camera state. You must call storeState() first
     * @returns whether it was successful or not
     * @hidden
     */
    TargetCamera.prototype._restoreStateValues = function () {
        if (!_super.prototype._restoreStateValues.call(this)) {
            return false;
        }
        this.position = this._storedPosition.clone();
        this.rotation = this._storedRotation.clone();
        if (this.rotationQuaternion) {
            this.rotationQuaternion = this._storedRotationQuaternion.clone();
        }
        this.cameraDirection.copyFromFloats(0, 0, 0);
        this.cameraRotation.copyFromFloats(0, 0);
        return true;
    };
    /** @hidden */
    TargetCamera.prototype._initCache = function () {
        _super.prototype._initCache.call(this);
        this._cache.lockedTarget = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.rotation = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.rotationQuaternion = new Quaternion(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    };
    /** @hidden */
    TargetCamera.prototype._updateCache = function (ignoreParentClass) {
        if (!ignoreParentClass) {
            _super.prototype._updateCache.call(this);
        }
        var lockedTargetPosition = this._getLockedTargetPosition();
        if (!lockedTargetPosition) {
            this._cache.lockedTarget = null;
        }
        else {
            if (!this._cache.lockedTarget) {
                this._cache.lockedTarget = lockedTargetPosition.clone();
            }
            else {
                this._cache.lockedTarget.copyFrom(lockedTargetPosition);
            }
        }
        this._cache.rotation.copyFrom(this.rotation);
        if (this.rotationQuaternion) {
            this._cache.rotationQuaternion.copyFrom(this.rotationQuaternion);
        }
    };
    // Synchronized
    /** @hidden */
    TargetCamera.prototype._isSynchronizedViewMatrix = function () {
        if (!_super.prototype._isSynchronizedViewMatrix.call(this)) {
            return false;
        }
        var lockedTargetPosition = this._getLockedTargetPosition();
        return (this._cache.lockedTarget ? this._cache.lockedTarget.equals(lockedTargetPosition) : !lockedTargetPosition)
            && (this.rotationQuaternion ? this.rotationQuaternion.equals(this._cache.rotationQuaternion) : this._cache.rotation.equals(this.rotation));
    };
    // Methods
    /** @hidden */
    TargetCamera.prototype._computeLocalCameraSpeed = function () {
        var engine = this.getEngine();
        return this.speed * Math.sqrt((engine.getDeltaTime() / (engine.getFps() * 100.0)));
    };
    // Target
    /**
     * Defines the target the camera should look at.
     * This will automatically adapt alpha beta and radius to fit within the new target.
     * @param target Defines the new target as a Vector or a mesh
     */
    TargetCamera.prototype.setTarget = function (target) {
        this.upVector.normalize();
        this._initialFocalDistance = target.subtract(this.position).length();
        if (this.position.z === target.z) {
            this.position.z += Epsilon;
        }
        Matrix.LookAtLHToRef(this.position, target, this._defaultUp, this._camMatrix);
        this._camMatrix.invert();
        this.rotation.x = Math.atan(this._camMatrix.m[6] / this._camMatrix.m[10]);
        var vDir = target.subtract(this.position);
        if (vDir.x >= 0.0) {
            this.rotation.y = (-Math.atan(vDir.z / vDir.x) + Math.PI / 2.0);
        }
        else {
            this.rotation.y = (-Math.atan(vDir.z / vDir.x) - Math.PI / 2.0);
        }
        this.rotation.z = 0;
        if (isNaN(this.rotation.x)) {
            this.rotation.x = 0;
        }
        if (isNaN(this.rotation.y)) {
            this.rotation.y = 0;
        }
        if (isNaN(this.rotation.z)) {
            this.rotation.z = 0;
        }
        if (this.rotationQuaternion) {
            Quaternion.RotationYawPitchRollToRef(this.rotation.y, this.rotation.x, this.rotation.z, this.rotationQuaternion);
        }
    };
    /**
     * Return the current target position of the camera. This value is expressed in local space.
     * @returns the target position
     */
    TargetCamera.prototype.getTarget = function () {
        return this._currentTarget;
    };
    /** @hidden */
    TargetCamera.prototype._decideIfNeedsToMove = function () {
        return Math.abs(this.cameraDirection.x) > 0 || Math.abs(this.cameraDirection.y) > 0 || Math.abs(this.cameraDirection.z) > 0;
    };
    /** @hidden */
    TargetCamera.prototype._updatePosition = function () {
        if (this.parent) {
            this.parent.getWorldMatrix().invertToRef(Tmp.Matrix[0]);
            Vector3.TransformNormalToRef(this.cameraDirection, Tmp.Matrix[0], Tmp.Vector3[0]);
            this.position.addInPlace(Tmp.Vector3[0]);
            return;
        }
        this.position.addInPlace(this.cameraDirection);
    };
    /** @hidden */
    TargetCamera.prototype._checkInputs = function () {
        var needToMove = this._decideIfNeedsToMove();
        var needToRotate = Math.abs(this.cameraRotation.x) > 0 || Math.abs(this.cameraRotation.y) > 0;
        // Move
        if (needToMove) {
            this._updatePosition();
        }
        // Rotate
        if (needToRotate) {
            this.rotation.x += this.cameraRotation.x;
            this.rotation.y += this.cameraRotation.y;
            //rotate, if quaternion is set and rotation was used
            if (this.rotationQuaternion) {
                var len = this.rotation.lengthSquared();
                if (len) {
                    Quaternion.RotationYawPitchRollToRef(this.rotation.y, this.rotation.x, this.rotation.z, this.rotationQuaternion);
                }
            }
            if (!this.noRotationConstraint) {
                var limit = (Math.PI / 2) * 0.95;
                if (this.rotation.x > limit) {
                    this.rotation.x = limit;
                }
                if (this.rotation.x < -limit) {
                    this.rotation.x = -limit;
                }
            }
        }
        // Inertia
        if (needToMove) {
            if (Math.abs(this.cameraDirection.x) < this.speed * Epsilon) {
                this.cameraDirection.x = 0;
            }
            if (Math.abs(this.cameraDirection.y) < this.speed * Epsilon) {
                this.cameraDirection.y = 0;
            }
            if (Math.abs(this.cameraDirection.z) < this.speed * Epsilon) {
                this.cameraDirection.z = 0;
            }
            this.cameraDirection.scaleInPlace(this.inertia);
        }
        if (needToRotate) {
            if (Math.abs(this.cameraRotation.x) < this.speed * Epsilon) {
                this.cameraRotation.x = 0;
            }
            if (Math.abs(this.cameraRotation.y) < this.speed * Epsilon) {
                this.cameraRotation.y = 0;
            }
            this.cameraRotation.scaleInPlace(this.inertia);
        }
        _super.prototype._checkInputs.call(this);
    };
    TargetCamera.prototype._updateCameraRotationMatrix = function () {
        if (this.rotationQuaternion) {
            this.rotationQuaternion.toRotationMatrix(this._cameraRotationMatrix);
        }
        else {
            Matrix.RotationYawPitchRollToRef(this.rotation.y, this.rotation.x, this.rotation.z, this._cameraRotationMatrix);
        }
    };
    /**
     * Update the up vector to apply the rotation of the camera (So if you changed the camera rotation.z this will let you update the up vector as well)
     * @returns the current camera
     */
    TargetCamera.prototype._rotateUpVectorWithCameraRotationMatrix = function () {
        Vector3.TransformNormalToRef(this._defaultUp, this._cameraRotationMatrix, this.upVector);
        return this;
    };
    /** @hidden */
    TargetCamera.prototype._getViewMatrix = function () {
        if (this.lockedTarget) {
            this.setTarget(this._getLockedTargetPosition());
        }
        // Compute
        this._updateCameraRotationMatrix();
        // Apply the changed rotation to the upVector
        if (this.rotationQuaternion && this._cachedQuaternionRotationZ != this.rotationQuaternion.z) {
            this._rotateUpVectorWithCameraRotationMatrix();
            this._cachedQuaternionRotationZ = this.rotationQuaternion.z;
        }
        else if (this._cachedRotationZ != this.rotation.z) {
            this._rotateUpVectorWithCameraRotationMatrix();
            this._cachedRotationZ = this.rotation.z;
        }
        Vector3.TransformCoordinatesToRef(this._referencePoint, this._cameraRotationMatrix, this._transformedReferencePoint);
        // Computing target and final matrix
        this.position.addToRef(this._transformedReferencePoint, this._currentTarget);
        if (this.updateUpVectorFromRotation) {
            if (this.rotationQuaternion) {
                Axis.Y.rotateByQuaternionToRef(this.rotationQuaternion, this.upVector);
            }
            else {
                Quaternion.FromEulerVectorToRef(this.rotation, this._tmpQuaternion);
                Axis.Y.rotateByQuaternionToRef(this._tmpQuaternion, this.upVector);
            }
        }
        this._computeViewMatrix(this.position, this._currentTarget, this.upVector);
        return this._viewMatrix;
    };
    TargetCamera.prototype._computeViewMatrix = function (position, target, up) {
        if (this.parent) {
            var parentWorldMatrix = this.parent.getWorldMatrix();
            Vector3.TransformCoordinatesToRef(position, parentWorldMatrix, this._globalPosition);
            Vector3.TransformCoordinatesToRef(target, parentWorldMatrix, this._globalCurrentTarget);
            Vector3.TransformNormalToRef(up, parentWorldMatrix, this._globalCurrentUpVector);
            this._markSyncedWithParent();
        }
        else {
            this._globalPosition.copyFrom(position);
            this._globalCurrentTarget.copyFrom(target);
            this._globalCurrentUpVector.copyFrom(up);
        }
        if (this.getScene().useRightHandedSystem) {
            Matrix.LookAtRHToRef(this._globalPosition, this._globalCurrentTarget, this._globalCurrentUpVector, this._viewMatrix);
        }
        else {
            Matrix.LookAtLHToRef(this._globalPosition, this._globalCurrentTarget, this._globalCurrentUpVector, this._viewMatrix);
        }
    };
    /**
     * @hidden
     */
    TargetCamera.prototype.createRigCamera = function (name, cameraIndex) {
        if (this.cameraRigMode !== Camera.RIG_MODE_NONE) {
            var rigCamera = new TargetCamera(name, this.position.clone(), this.getScene());
            if (this.cameraRigMode === Camera.RIG_MODE_VR || this.cameraRigMode === Camera.RIG_MODE_WEBVR) {
                if (!this.rotationQuaternion) {
                    this.rotationQuaternion = new Quaternion();
                }
                rigCamera._cameraRigParams = {};
                rigCamera.rotationQuaternion = new Quaternion();
            }
            return rigCamera;
        }
        return null;
    };
    /**
     * @hidden
     */
    TargetCamera.prototype._updateRigCameras = function () {
        var camLeft = this._rigCameras[0];
        var camRight = this._rigCameras[1];
        this.computeWorldMatrix();
        switch (this.cameraRigMode) {
            case Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH:
            case Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL:
            case Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED:
            case Camera.RIG_MODE_STEREOSCOPIC_OVERUNDER:
                //provisionnaly using _cameraRigParams.stereoHalfAngle instead of calculations based on _cameraRigParams.interaxialDistance:
                var leftSign = (this.cameraRigMode === Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED) ? 1 : -1;
                var rightSign = (this.cameraRigMode === Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED) ? -1 : 1;
                this._getRigCamPositionAndTarget(this._cameraRigParams.stereoHalfAngle * leftSign, camLeft);
                this._getRigCamPositionAndTarget(this._cameraRigParams.stereoHalfAngle * rightSign, camRight);
                break;
            case Camera.RIG_MODE_VR:
                if (camLeft.rotationQuaternion) {
                    camLeft.rotationQuaternion.copyFrom(this.rotationQuaternion);
                    camRight.rotationQuaternion.copyFrom(this.rotationQuaternion);
                }
                else {
                    camLeft.rotation.copyFrom(this.rotation);
                    camRight.rotation.copyFrom(this.rotation);
                }
                camLeft.position.copyFrom(this.position);
                camRight.position.copyFrom(this.position);
                break;
        }
        _super.prototype._updateRigCameras.call(this);
    };
    TargetCamera.prototype._getRigCamPositionAndTarget = function (halfSpace, rigCamera) {
        var target = this.getTarget();
        target.subtractToRef(this.position, TargetCamera._TargetFocalPoint);
        TargetCamera._TargetFocalPoint.normalize().scaleInPlace(this._initialFocalDistance);
        var newFocalTarget = TargetCamera._TargetFocalPoint.addInPlace(this.position);
        Matrix.TranslationToRef(-newFocalTarget.x, -newFocalTarget.y, -newFocalTarget.z, TargetCamera._TargetTransformMatrix);
        TargetCamera._TargetTransformMatrix.multiplyToRef(Matrix.RotationY(halfSpace), TargetCamera._RigCamTransformMatrix);
        Matrix.TranslationToRef(newFocalTarget.x, newFocalTarget.y, newFocalTarget.z, TargetCamera._TargetTransformMatrix);
        TargetCamera._RigCamTransformMatrix.multiplyToRef(TargetCamera._TargetTransformMatrix, TargetCamera._RigCamTransformMatrix);
        Vector3.TransformCoordinatesToRef(this.position, TargetCamera._RigCamTransformMatrix, rigCamera.position);
        rigCamera.setTarget(newFocalTarget);
    };
    /**
     * Gets the current object class name.
     * @return the class name
     */
    TargetCamera.prototype.getClassName = function () {
        return "TargetCamera";
    };
    TargetCamera._RigCamTransformMatrix = new Matrix();
    TargetCamera._TargetTransformMatrix = new Matrix();
    TargetCamera._TargetFocalPoint = new Vector3();
    __decorate([
        serializeAsVector3()
    ], TargetCamera.prototype, "rotation", void 0);
    __decorate([
        serialize()
    ], TargetCamera.prototype, "speed", void 0);
    __decorate([
        serializeAsMeshReference("lockedTargetId")
    ], TargetCamera.prototype, "lockedTarget", void 0);
    return TargetCamera;
}(Camera));

/**
 * This represents a free type of camera. It can be useful in First Person Shooter game for instance.
 * Please consider using the new UniversalCamera instead as it adds more functionality like the gamepad.
 * @see http://doc.babylonjs.com/features/cameras#universal-camera
 */
var FreeCamera = /** @class */ (function (_super) {
    __extends(FreeCamera, _super);
    /**
     * Instantiates a Free Camera.
     * This represents a free type of camera. It can be useful in First Person Shooter game for instance.
     * Please consider using the new UniversalCamera instead as it adds more functionality like touch to this camera.
     * @see http://doc.babylonjs.com/features/cameras#universal-camera
     * @param name Define the name of the camera in the scene
     * @param position Define the start position of the camera in the scene
     * @param scene Define the scene the camera belongs to
     * @param setActiveOnSceneIfNoneActive Defines wheter the camera should be marked as active if not other active cameras have been defined
     */
    function FreeCamera(name, position, scene, setActiveOnSceneIfNoneActive) {
        if (setActiveOnSceneIfNoneActive === void 0) { setActiveOnSceneIfNoneActive = true; }
        var _this = _super.call(this, name, position, scene, setActiveOnSceneIfNoneActive) || this;
        /**
         * Define the collision ellipsoid of the camera.
         * This is helpful to simulate a camera body like the player body around the camera
         * @see http://doc.babylonjs.com/babylon101/cameras,_mesh_collisions_and_gravity#arcrotatecamera
         */
        _this.ellipsoid = new Vector3(0.5, 1, 0.5);
        /**
         * Define an offset for the position of the ellipsoid around the camera.
         * This can be helpful to determine the center of the body near the gravity center of the body
         * instead of its head.
         */
        _this.ellipsoidOffset = new Vector3(0, 0, 0);
        /**
         * Enable or disable collisions of the camera with the rest of the scene objects.
         */
        _this.checkCollisions = false;
        /**
         * Enable or disable gravity on the camera.
         */
        _this.applyGravity = false;
        _this._needMoveForGravity = false;
        _this._oldPosition = Vector3.Zero();
        _this._diffPosition = Vector3.Zero();
        _this._newPosition = Vector3.Zero();
        // Collisions
        _this._collisionMask = -1;
        _this._onCollisionPositionChange = function (collisionId, newPosition, collidedMesh) {
            if (collidedMesh === void 0) { collidedMesh = null; }
            var updatePosition = function (newPos) {
                _this._newPosition.copyFrom(newPos);
                _this._newPosition.subtractToRef(_this._oldPosition, _this._diffPosition);
                if (_this._diffPosition.length() > Engine.CollisionsEpsilon) {
                    _this.position.addInPlace(_this._diffPosition);
                    if (_this.onCollide && collidedMesh) {
                        _this.onCollide(collidedMesh);
                    }
                }
            };
            updatePosition(newPosition);
        };
        _this.inputs = new FreeCameraInputsManager(_this);
        _this.inputs.addKeyboard().addMouse();
        return _this;
    }
    Object.defineProperty(FreeCamera.prototype, "angularSensibility", {
        /**
         * Gets the input sensibility for a mouse input. (default is 2000.0)
         * Higher values reduce sensitivity.
         */
        get: function () {
            var mouse = this.inputs.attached["mouse"];
            if (mouse) {
                return mouse.angularSensibility;
            }
            return 0;
        },
        /**
         * Sets the input sensibility for a mouse input. (default is 2000.0)
         * Higher values reduce sensitivity.
         */
        set: function (value) {
            var mouse = this.inputs.attached["mouse"];
            if (mouse) {
                mouse.angularSensibility = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreeCamera.prototype, "keysUp", {
        /**
         * Gets or Set the list of keyboard keys used to control the forward move of the camera.
         */
        get: function () {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                return keyboard.keysUp;
            }
            return [];
        },
        set: function (value) {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                keyboard.keysUp = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreeCamera.prototype, "keysDown", {
        /**
         * Gets or Set the list of keyboard keys used to control the backward move of the camera.
         */
        get: function () {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                return keyboard.keysDown;
            }
            return [];
        },
        set: function (value) {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                keyboard.keysDown = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreeCamera.prototype, "keysLeft", {
        /**
         * Gets or Set the list of keyboard keys used to control the left strafe move of the camera.
         */
        get: function () {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                return keyboard.keysLeft;
            }
            return [];
        },
        set: function (value) {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                keyboard.keysLeft = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreeCamera.prototype, "keysRight", {
        /**
         * Gets or Set the list of keyboard keys used to control the right strafe move of the camera.
         */
        get: function () {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                return keyboard.keysRight;
            }
            return [];
        },
        set: function (value) {
            var keyboard = this.inputs.attached["keyboard"];
            if (keyboard) {
                keyboard.keysRight = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Attached controls to the current camera.
     * @param element Defines the element the controls should be listened from
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCamera.prototype.attachControl = function (element, noPreventDefault) {
        this.inputs.attachElement(element, noPreventDefault);
    };
    /**
     * Detach the current controls from the camera.
     * The camera will stop reacting to inputs.
     * @param element Defines the element to stop listening the inputs from
     */
    FreeCamera.prototype.detachControl = function (element) {
        this.inputs.detachElement(element);
        this.cameraDirection = new Vector3(0, 0, 0);
        this.cameraRotation = new Vector2(0, 0);
    };
    Object.defineProperty(FreeCamera.prototype, "collisionMask", {
        /**
         * Define a collision mask to limit the list of object the camera can collide with
         */
        get: function () {
            return this._collisionMask;
        },
        set: function (mask) {
            this._collisionMask = !isNaN(mask) ? mask : -1;
        },
        enumerable: true,
        configurable: true
    });
    /** @hidden */
    FreeCamera.prototype._collideWithWorld = function (displacement) {
        var globalPosition;
        if (this.parent) {
            globalPosition = Vector3.TransformCoordinates(this.position, this.parent.getWorldMatrix());
        }
        else {
            globalPosition = this.position;
        }
        globalPosition.subtractFromFloatsToRef(0, this.ellipsoid.y, 0, this._oldPosition);
        this._oldPosition.addInPlace(this.ellipsoidOffset);
        var coordinator = this.getScene().collisionCoordinator;
        if (!this._collider) {
            this._collider = coordinator.createCollider();
        }
        this._collider._radius = this.ellipsoid;
        this._collider.collisionMask = this._collisionMask;
        //no need for clone, as long as gravity is not on.
        var actualDisplacement = displacement;
        //add gravity to the direction to prevent the dual-collision checking
        if (this.applyGravity) {
            //this prevents mending with cameraDirection, a global variable of the free camera class.
            actualDisplacement = displacement.add(this.getScene().gravity);
        }
        coordinator.getNewPosition(this._oldPosition, actualDisplacement, this._collider, 3, null, this._onCollisionPositionChange, this.uniqueId);
    };
    /** @hidden */
    FreeCamera.prototype._checkInputs = function () {
        if (!this._localDirection) {
            this._localDirection = Vector3.Zero();
            this._transformedDirection = Vector3.Zero();
        }
        this.inputs.checkInputs();
        _super.prototype._checkInputs.call(this);
    };
    /** @hidden */
    FreeCamera.prototype._decideIfNeedsToMove = function () {
        return this._needMoveForGravity || Math.abs(this.cameraDirection.x) > 0 || Math.abs(this.cameraDirection.y) > 0 || Math.abs(this.cameraDirection.z) > 0;
    };
    /** @hidden */
    FreeCamera.prototype._updatePosition = function () {
        if (this.checkCollisions && this.getScene().collisionsEnabled) {
            this._collideWithWorld(this.cameraDirection);
        }
        else {
            _super.prototype._updatePosition.call(this);
        }
    };
    /**
     * Destroy the camera and release the current resources hold by it.
     */
    FreeCamera.prototype.dispose = function () {
        this.inputs.clear();
        _super.prototype.dispose.call(this);
    };
    /**
     * Gets the current object class name.
     * @return the class name
     */
    FreeCamera.prototype.getClassName = function () {
        return "FreeCamera";
    };
    __decorate([
        serializeAsVector3()
    ], FreeCamera.prototype, "ellipsoid", void 0);
    __decorate([
        serializeAsVector3()
    ], FreeCamera.prototype, "ellipsoidOffset", void 0);
    __decorate([
        serialize()
    ], FreeCamera.prototype, "checkCollisions", void 0);
    __decorate([
        serialize()
    ], FreeCamera.prototype, "applyGravity", void 0);
    return FreeCamera;
}(TargetCamera));

var name = 'postprocessVertexShader';
var shader = "\nattribute vec2 position;\nuniform vec2 scale;\n\nvarying vec2 vUV;\nconst vec2 madd=vec2(0.5,0.5);\nvoid main(void) {\nvUV=(position*madd+madd)*scale;\ngl_Position=vec4(position,0.0,1.0);\n}";
Effect.ShadersStore[name] = shader;

/**
 * PostProcess can be used to apply a shader to a texture after it has been rendered
 * See https://doc.babylonjs.com/how_to/how_to_use_postprocesses
 */
var PostProcess = /** @class */ (function () {
    /**
     * Creates a new instance PostProcess
     * @param name The name of the PostProcess.
     * @param fragmentUrl The url of the fragment shader to be used.
     * @param parameters Array of the names of uniform non-sampler2D variables that will be passed to the shader.
     * @param samplers Array of the names of uniform sampler2D variables that will be passed to the shader.
     * @param options The required width/height ratio to downsize to before computing the render pass. (Use 1.0 for full size)
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param defines String of defines that will be set when running the fragment shader. (default: null)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param vertexUrl The url of the vertex shader to be used. (default: "postprocess")
     * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
     * @param blockCompilation If the shader should not be compiled imediatly. (default: false)
     */
    function PostProcess(
    /** Name of the PostProcess. */
    name, fragmentUrl, parameters, samplers, options, camera, samplingMode, engine, reusable, defines, textureType, vertexUrl, indexParameters, blockCompilation) {
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE; }
        if (defines === void 0) { defines = null; }
        if (textureType === void 0) { textureType = Constants.TEXTURETYPE_UNSIGNED_INT; }
        if (vertexUrl === void 0) { vertexUrl = "postprocess"; }
        if (blockCompilation === void 0) { blockCompilation = false; }
        this.name = name;
        /**
        * Width of the texture to apply the post process on
        */
        this.width = -1;
        /**
        * Height of the texture to apply the post process on
        */
        this.height = -1;
        /**
        * Internal, reference to the location where this postprocess was output to. (Typically the texture on the next postprocess in the chain)
        * @hidden
        */
        this._outputTexture = null;
        /**
        * If the buffer needs to be cleared before applying the post process. (default: true)
        * Should be set to false if shader will overwrite all previous pixels.
        */
        this.autoClear = true;
        /**
        * Type of alpha mode to use when performing the post process (default: Engine.ALPHA_DISABLE)
        */
        this.alphaMode = Constants.ALPHA_DISABLE;
        /**
        * Animations to be used for the post processing
        */
        this.animations = new Array();
        /**
         * Enable Pixel Perfect mode where texture is not scaled to be power of 2.
         * Can only be used on a single postprocess or on the last one of a chain. (default: false)
         */
        this.enablePixelPerfectMode = false;
        /**
         * Force the postprocess to be applied without taking in account viewport
         */
        this.forceFullscreenViewport = true;
        /**
         * Scale mode for the post process (default: Engine.SCALEMODE_FLOOR)
         *
         * | Value | Type                                | Description |
         * | ----- | ----------------------------------- | ----------- |
         * | 1     | SCALEMODE_FLOOR                     | [engine.scalemode_floor](http://doc.babylonjs.com/api/classes/babylon.engine#scalemode_floor) |
         * | 2     | SCALEMODE_NEAREST                   | [engine.scalemode_nearest](http://doc.babylonjs.com/api/classes/babylon.engine#scalemode_nearest) |
         * | 3     | SCALEMODE_CEILING                   | [engine.scalemode_ceiling](http://doc.babylonjs.com/api/classes/babylon.engine#scalemode_ceiling) |
         *
         */
        this.scaleMode = Constants.SCALEMODE_FLOOR;
        /**
        * Force textures to be a power of two (default: false)
        */
        this.alwaysForcePOT = false;
        this._samples = 1;
        /**
        * Modify the scale of the post process to be the same as the viewport (default: false)
        */
        this.adaptScaleToCurrentViewport = false;
        this._reusable = false;
        /**
        * Smart array of input and output textures for the post process.
        * @hidden
        */
        this._textures = new SmartArray(2);
        /**
        * The index in _textures that corresponds to the output texture.
        * @hidden
        */
        this._currentRenderTextureInd = 0;
        this._scaleRatio = new Vector2(1, 1);
        this._texelSize = Vector2.Zero();
        // Events
        /**
        * An event triggered when the postprocess is activated.
        */
        this.onActivateObservable = new Observable();
        /**
        * An event triggered when the postprocess changes its size.
        */
        this.onSizeChangedObservable = new Observable();
        /**
        * An event triggered when the postprocess applies its effect.
        */
        this.onApplyObservable = new Observable();
        /**
        * An event triggered before rendering the postprocess
        */
        this.onBeforeRenderObservable = new Observable();
        /**
        * An event triggered after rendering the postprocess
        */
        this.onAfterRenderObservable = new Observable();
        if (camera != null) {
            this._camera = camera;
            this._scene = camera.getScene();
            camera.attachPostProcess(this);
            this._engine = this._scene.getEngine();
            this._scene.postProcesses.push(this);
            this.uniqueId = this._scene.getUniqueId();
        }
        else if (engine) {
            this._engine = engine;
            this._engine.postProcesses.push(this);
        }
        this._options = options;
        this.renderTargetSamplingMode = samplingMode ? samplingMode : Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        this._reusable = reusable || false;
        this._textureType = textureType;
        this._samplers = samplers || [];
        this._samplers.push("textureSampler");
        this._fragmentUrl = fragmentUrl;
        this._vertexUrl = vertexUrl;
        this._parameters = parameters || [];
        this._parameters.push("scale");
        this._indexParameters = indexParameters;
        if (!blockCompilation) {
            this.updateEffect(defines);
        }
    }
    Object.defineProperty(PostProcess.prototype, "samples", {
        /**
        * Number of sample textures (default: 1)
        */
        get: function () {
            return this._samples;
        },
        set: function (n) {
            var _this = this;
            this._samples = n;
            this._textures.forEach(function (texture) {
                if (texture.samples !== _this._samples) {
                    _this._engine.updateRenderTargetTextureSampleCount(texture, _this._samples);
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the fragment url or shader name used in the post process.
     * @returns the fragment url or name in the shader store.
     */
    PostProcess.prototype.getEffectName = function () {
        return this._fragmentUrl;
    };
    Object.defineProperty(PostProcess.prototype, "onActivate", {
        /**
        * A function that is added to the onActivateObservable
        */
        set: function (callback) {
            if (this._onActivateObserver) {
                this.onActivateObservable.remove(this._onActivateObserver);
            }
            if (callback) {
                this._onActivateObserver = this.onActivateObservable.add(callback);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostProcess.prototype, "onSizeChanged", {
        /**
        * A function that is added to the onSizeChangedObservable
        */
        set: function (callback) {
            if (this._onSizeChangedObserver) {
                this.onSizeChangedObservable.remove(this._onSizeChangedObserver);
            }
            this._onSizeChangedObserver = this.onSizeChangedObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostProcess.prototype, "onApply", {
        /**
        * A function that is added to the onApplyObservable
        */
        set: function (callback) {
            if (this._onApplyObserver) {
                this.onApplyObservable.remove(this._onApplyObserver);
            }
            this._onApplyObserver = this.onApplyObservable.add(callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostProcess.prototype, "onBeforeRender", {
        /**
        * A function that is added to the onBeforeRenderObservable
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
    Object.defineProperty(PostProcess.prototype, "onAfterRender", {
        /**
        * A function that is added to the onAfterRenderObservable
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
    Object.defineProperty(PostProcess.prototype, "inputTexture", {
        /**
        * The input texture for this post process and the output texture of the previous post process. When added to a pipeline the previous post process will
        * render it's output into this texture and this texture will be used as textureSampler in the fragment shader of this post process.
        */
        get: function () {
            return this._textures.data[this._currentRenderTextureInd];
        },
        set: function (value) {
            this._forcedOutputTexture = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * Gets the camera which post process is applied to.
    * @returns The camera the post process is applied to.
    */
    PostProcess.prototype.getCamera = function () {
        return this._camera;
    };
    Object.defineProperty(PostProcess.prototype, "texelSize", {
        /**
        * Gets the texel size of the postprocess.
        * See https://en.wikipedia.org/wiki/Texel_(graphics)
        */
        get: function () {
            if (this._shareOutputWithPostProcess) {
                return this._shareOutputWithPostProcess.texelSize;
            }
            if (this._forcedOutputTexture) {
                this._texelSize.copyFromFloats(1.0 / this._forcedOutputTexture.width, 1.0 / this._forcedOutputTexture.height);
            }
            return this._texelSize;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets a string idenfifying the name of the class
     * @returns "PostProcess" string
     */
    PostProcess.prototype.getClassName = function () {
        return "PostProcess";
    };
    /**
     * Gets the engine which this post process belongs to.
     * @returns The engine the post process was enabled with.
     */
    PostProcess.prototype.getEngine = function () {
        return this._engine;
    };
    /**
     * The effect that is created when initializing the post process.
     * @returns The created effect corrisponding the the postprocess.
     */
    PostProcess.prototype.getEffect = function () {
        return this._effect;
    };
    /**
     * To avoid multiple redundant textures for multiple post process, the output the output texture for this post process can be shared with another.
     * @param postProcess The post process to share the output with.
     * @returns This post process.
     */
    PostProcess.prototype.shareOutputWith = function (postProcess) {
        this._disposeTextures();
        this._shareOutputWithPostProcess = postProcess;
        return this;
    };
    /**
     * Reverses the effect of calling shareOutputWith and returns the post process back to its original state.
     * This should be called if the post process that shares output with this post process is disabled/disposed.
     */
    PostProcess.prototype.useOwnOutput = function () {
        if (this._textures.length == 0) {
            this._textures = new SmartArray(2);
        }
        this._shareOutputWithPostProcess = null;
    };
    /**
     * Updates the effect with the current post process compile time values and recompiles the shader.
     * @param defines Define statements that should be added at the beginning of the shader. (default: null)
     * @param uniforms Set of uniform variables that will be passed to the shader. (default: null)
     * @param samplers Set of Texture2D variables that will be passed to the shader. (default: null)
     * @param indexParameters The index parameters to be used for babylons include syntax "#include<kernelBlurVaryingDeclaration>[0..varyingCount]". (default: undefined) See usage in babylon.blurPostProcess.ts and kernelBlur.vertex.fx
     * @param onCompiled Called when the shader has been compiled.
     * @param onError Called if there is an error when compiling a shader.
     */
    PostProcess.prototype.updateEffect = function (defines, uniforms, samplers, indexParameters, onCompiled, onError) {
        if (defines === void 0) { defines = null; }
        if (uniforms === void 0) { uniforms = null; }
        if (samplers === void 0) { samplers = null; }
        this._effect = this._engine.createEffect({ vertex: this._vertexUrl, fragment: this._fragmentUrl }, ["position"], uniforms || this._parameters, samplers || this._samplers, defines !== null ? defines : "", undefined, onCompiled, onError, indexParameters || this._indexParameters);
    };
    /**
     * The post process is reusable if it can be used multiple times within one frame.
     * @returns If the post process is reusable
     */
    PostProcess.prototype.isReusable = function () {
        return this._reusable;
    };
    /** invalidate frameBuffer to hint the postprocess to create a depth buffer */
    PostProcess.prototype.markTextureDirty = function () {
        this.width = -1;
    };
    /**
     * Activates the post process by intializing the textures to be used when executed. Notifies onActivateObservable.
     * When this post process is used in a pipeline, this is call will bind the input texture of this post process to the output of the previous.
     * @param camera The camera that will be used in the post process. This camera will be used when calling onActivateObservable.
     * @param sourceTexture The source texture to be inspected to get the width and height if not specified in the post process constructor. (default: null)
     * @param forceDepthStencil If true, a depth and stencil buffer will be generated. (default: false)
     * @returns The target texture that was bound to be written to.
     */
    PostProcess.prototype.activate = function (camera, sourceTexture, forceDepthStencil) {
        var _this = this;
        if (sourceTexture === void 0) { sourceTexture = null; }
        camera = camera || this._camera;
        var scene = camera.getScene();
        var engine = scene.getEngine();
        var maxSize = engine.getCaps().maxTextureSize;
        var requiredWidth = ((sourceTexture ? sourceTexture.width : this._engine.getRenderWidth(true)) * this._options) | 0;
        var requiredHeight = ((sourceTexture ? sourceTexture.height : this._engine.getRenderHeight(true)) * this._options) | 0;
        // If rendering to a webvr camera's left or right eye only half the width should be used to avoid resize when rendered to screen
        var webVRCamera = camera.parent;
        if (webVRCamera && (webVRCamera.leftCamera == camera || webVRCamera.rightCamera == camera)) {
            requiredWidth /= 2;
        }
        var desiredWidth = (this._options.width || requiredWidth);
        var desiredHeight = this._options.height || requiredHeight;
        if (!this._shareOutputWithPostProcess && !this._forcedOutputTexture) {
            if (this.adaptScaleToCurrentViewport) {
                var currentViewport = engine.currentViewport;
                if (currentViewport) {
                    desiredWidth *= currentViewport.width;
                    desiredHeight *= currentViewport.height;
                }
            }
            if (this.renderTargetSamplingMode === Constants.TEXTURE_TRILINEAR_SAMPLINGMODE || this.alwaysForcePOT) {
                if (!this._options.width) {
                    desiredWidth = engine.needPOTTextures ? Tools.GetExponentOfTwo(desiredWidth, maxSize, this.scaleMode) : desiredWidth;
                }
                if (!this._options.height) {
                    desiredHeight = engine.needPOTTextures ? Tools.GetExponentOfTwo(desiredHeight, maxSize, this.scaleMode) : desiredHeight;
                }
            }
            if (this.width !== desiredWidth || this.height !== desiredHeight) {
                if (this._textures.length > 0) {
                    for (var i = 0; i < this._textures.length; i++) {
                        this._engine._releaseTexture(this._textures.data[i]);
                    }
                    this._textures.reset();
                }
                this.width = desiredWidth;
                this.height = desiredHeight;
                var textureSize = { width: this.width, height: this.height };
                var textureOptions = {
                    generateMipMaps: false,
                    generateDepthBuffer: forceDepthStencil || camera._postProcesses.indexOf(this) === 0,
                    generateStencilBuffer: (forceDepthStencil || camera._postProcesses.indexOf(this) === 0) && this._engine.isStencilEnable,
                    samplingMode: this.renderTargetSamplingMode,
                    type: this._textureType
                };
                this._textures.push(this._engine.createRenderTargetTexture(textureSize, textureOptions));
                if (this._reusable) {
                    this._textures.push(this._engine.createRenderTargetTexture(textureSize, textureOptions));
                }
                this._texelSize.copyFromFloats(1.0 / this.width, 1.0 / this.height);
                this.onSizeChangedObservable.notifyObservers(this);
            }
            this._textures.forEach(function (texture) {
                if (texture.samples !== _this.samples) {
                    _this._engine.updateRenderTargetTextureSampleCount(texture, _this.samples);
                }
            });
        }
        var target;
        if (this._shareOutputWithPostProcess) {
            target = this._shareOutputWithPostProcess.inputTexture;
        }
        else if (this._forcedOutputTexture) {
            target = this._forcedOutputTexture;
            this.width = this._forcedOutputTexture.width;
            this.height = this._forcedOutputTexture.height;
        }
        else {
            target = this.inputTexture;
        }
        // Bind the input of this post process to be used as the output of the previous post process.
        if (this.enablePixelPerfectMode) {
            this._scaleRatio.copyFromFloats(requiredWidth / desiredWidth, requiredHeight / desiredHeight);
            this._engine.bindFramebuffer(target, 0, requiredWidth, requiredHeight, this.forceFullscreenViewport);
        }
        else {
            this._scaleRatio.copyFromFloats(1, 1);
            this._engine.bindFramebuffer(target, 0, undefined, undefined, this.forceFullscreenViewport);
        }
        this.onActivateObservable.notifyObservers(camera);
        // Clear
        if (this.autoClear && this.alphaMode === Constants.ALPHA_DISABLE) {
            this._engine.clear(this.clearColor ? this.clearColor : scene.clearColor, scene._allowPostProcessClearColor, true, true);
        }
        if (this._reusable) {
            this._currentRenderTextureInd = (this._currentRenderTextureInd + 1) % 2;
        }
        return target;
    };
    Object.defineProperty(PostProcess.prototype, "isSupported", {
        /**
         * If the post process is supported.
         */
        get: function () {
            return this._effect.isSupported;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostProcess.prototype, "aspectRatio", {
        /**
         * The aspect ratio of the output texture.
         */
        get: function () {
            if (this._shareOutputWithPostProcess) {
                return this._shareOutputWithPostProcess.aspectRatio;
            }
            if (this._forcedOutputTexture) {
                return this._forcedOutputTexture.width / this._forcedOutputTexture.height;
            }
            return this.width / this.height;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get a value indicating if the post-process is ready to be used
     * @returns true if the post-process is ready (shader is compiled)
     */
    PostProcess.prototype.isReady = function () {
        return this._effect && this._effect.isReady();
    };
    /**
     * Binds all textures and uniforms to the shader, this will be run on every pass.
     * @returns the effect corrisponding to this post process. Null if not compiled or not ready.
     */
    PostProcess.prototype.apply = function () {
        // Check
        if (!this._effect || !this._effect.isReady()) {
            return null;
        }
        // States
        this._engine.enableEffect(this._effect);
        this._engine.setState(false);
        this._engine.setDepthBuffer(false);
        this._engine.setDepthWrite(false);
        // Alpha
        this._engine.setAlphaMode(this.alphaMode);
        if (this.alphaConstants) {
            this.getEngine().setAlphaConstants(this.alphaConstants.r, this.alphaConstants.g, this.alphaConstants.b, this.alphaConstants.a);
        }
        // Bind the output texture of the preivous post process as the input to this post process.
        var source;
        if (this._shareOutputWithPostProcess) {
            source = this._shareOutputWithPostProcess.inputTexture;
        }
        else if (this._forcedOutputTexture) {
            source = this._forcedOutputTexture;
        }
        else {
            source = this.inputTexture;
        }
        this._effect._bindTexture("textureSampler", source);
        // Parameters
        this._effect.setVector2("scale", this._scaleRatio);
        this.onApplyObservable.notifyObservers(this._effect);
        return this._effect;
    };
    PostProcess.prototype._disposeTextures = function () {
        if (this._shareOutputWithPostProcess || this._forcedOutputTexture) {
            return;
        }
        if (this._textures.length > 0) {
            for (var i = 0; i < this._textures.length; i++) {
                this._engine._releaseTexture(this._textures.data[i]);
            }
        }
        this._textures.dispose();
    };
    /**
     * Disposes the post process.
     * @param camera The camera to dispose the post process on.
     */
    PostProcess.prototype.dispose = function (camera) {
        camera = camera || this._camera;
        this._disposeTextures();
        if (this._scene) {
            var index_1 = this._scene.postProcesses.indexOf(this);
            if (index_1 !== -1) {
                this._scene.postProcesses.splice(index_1, 1);
            }
        }
        else {
            var index_2 = this._engine.postProcesses.indexOf(this);
            if (index_2 !== -1) {
                this._engine.postProcesses.splice(index_2, 1);
            }
        }
        if (!camera) {
            return;
        }
        camera.detachPostProcess(this);
        var index = camera._postProcesses.indexOf(this);
        if (index === 0 && camera._postProcesses.length > 0) {
            var firstPostProcess = this._camera._getFirstPostProcess();
            if (firstPostProcess) {
                firstPostProcess.markTextureDirty();
            }
        }
        this.onActivateObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onApplyObservable.clear();
        this.onBeforeRenderObservable.clear();
        this.onSizeChangedObservable.clear();
    };
    return PostProcess;
}());

Engine.prototype.createRenderTargetCubeTexture = function (size, options) {
    var fullOptions = __assign({ generateMipMaps: true, generateDepthBuffer: true, generateStencilBuffer: false, type: Engine.TEXTURETYPE_UNSIGNED_INT, samplingMode: Engine.TEXTURE_TRILINEAR_SAMPLINGMODE, format: Engine.TEXTUREFORMAT_RGBA }, options);
    fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && fullOptions.generateStencilBuffer;
    if (fullOptions.type === Engine.TEXTURETYPE_FLOAT && !this._caps.textureFloatLinearFiltering) {
        // if floating point linear (gl.FLOAT) then force to NEAREST_SAMPLINGMODE
        fullOptions.samplingMode = Engine.TEXTURE_NEAREST_SAMPLINGMODE;
    }
    else if (fullOptions.type === Engine.TEXTURETYPE_HALF_FLOAT && !this._caps.textureHalfFloatLinearFiltering) {
        // if floating point linear (HALF_FLOAT) then force to NEAREST_SAMPLINGMODE
        fullOptions.samplingMode = Engine.TEXTURE_NEAREST_SAMPLINGMODE;
    }
    var gl = this._gl;
    var texture = new InternalTexture(this, InternalTexture.DATASOURCE_RENDERTARGET);
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
    var filters = this._getSamplingParameters(fullOptions.samplingMode, fullOptions.generateMipMaps);
    if (fullOptions.type === Engine.TEXTURETYPE_FLOAT && !this._caps.textureFloat) {
        fullOptions.type = Engine.TEXTURETYPE_UNSIGNED_INT;
        Logger.Warn("Float textures are not supported. Cube render target forced to TEXTURETYPE_UNESIGNED_BYTE type");
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, filters.mag);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, filters.min);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (var face = 0; face < 6; face++) {
        gl.texImage2D((gl.TEXTURE_CUBE_MAP_POSITIVE_X + face), 0, this._getRGBABufferInternalSizedFormat(fullOptions.type, fullOptions.format), size, size, 0, this._getInternalFormat(fullOptions.format), this._getWebGLTextureType(fullOptions.type), null);
    }
    // Create the framebuffer
    var framebuffer = gl.createFramebuffer();
    this._bindUnboundFramebuffer(framebuffer);
    texture._depthStencilBuffer = this._setupFramebufferDepthAttachments(fullOptions.generateStencilBuffer, fullOptions.generateDepthBuffer, size, size);
    // MipMaps
    if (fullOptions.generateMipMaps) {
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }
    // Unbind
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    this._bindUnboundFramebuffer(null);
    texture._framebuffer = framebuffer;
    texture.width = size;
    texture.height = size;
    texture.isReady = true;
    texture.isCube = true;
    texture.samples = 1;
    texture.generateMipMaps = fullOptions.generateMipMaps;
    texture.samplingMode = fullOptions.samplingMode;
    texture.type = fullOptions.type;
    texture.format = fullOptions.format;
    texture._generateDepthBuffer = fullOptions.generateDepthBuffer;
    texture._generateStencilBuffer = fullOptions.generateStencilBuffer;
    this._internalTexturesCache.push(texture);
    return texture;
};

/**
 * The ShaderMaterial object has the necessary methods to pass data from your scene to the Vertex and Fragment Shaders and returns a material that can be applied to any mesh.
 *
 * This returned material effects how the mesh will look based on the code in the shaders.
 *
 * @see http://doc.babylonjs.com/how_to/shader_material
 */
var ShaderMaterial = /** @class */ (function (_super) {
    __extends(ShaderMaterial, _super);
    /**
     * Instantiate a new shader material.
     * The ShaderMaterial object has the necessary methods to pass data from your scene to the Vertex and Fragment Shaders and returns a material that can be applied to any mesh.
     * This returned material effects how the mesh will look based on the code in the shaders.
     * @see http://doc.babylonjs.com/how_to/shader_material
     * @param name Define the name of the material in the scene
     * @param scene Define the scene the material belongs to
     * @param shaderPath Defines  the route to the shader code in one of three ways:
     *     - object - { vertex: "custom", fragment: "custom" }, used with Effect.ShadersStore["customVertexShader"] and Effect.ShadersStore["customFragmentShader"]
     *     - object - { vertexElement: "vertexShaderCode", fragmentElement: "fragmentShaderCode" }, used with shader code in <script> tags
     *     - string - "./COMMON_NAME", used with external files COMMON_NAME.vertex.fx and COMMON_NAME.fragment.fx in index.html folder.
     * @param options Define the options used to create the shader
     */
    function ShaderMaterial(name, scene, shaderPath, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, name, scene) || this;
        _this._textures = {};
        _this._textureArrays = {};
        _this._floats = {};
        _this._ints = {};
        _this._floatsArrays = {};
        _this._colors3 = {};
        _this._colors3Arrays = {};
        _this._colors4 = {};
        _this._vectors2 = {};
        _this._vectors3 = {};
        _this._vectors4 = {};
        _this._matrices = {};
        _this._matrices3x3 = {};
        _this._matrices2x2 = {};
        _this._vectors2Arrays = {};
        _this._vectors3Arrays = {};
        _this._cachedWorldViewMatrix = new Matrix();
        _this._shaderPath = shaderPath;
        _this._options = __assign({ needAlphaBlending: false, needAlphaTesting: false, attributes: ["position", "normal", "uv"], uniforms: ["worldViewProjection"], uniformBuffers: [], samplers: [], defines: [] }, options);
        return _this;
    }
    Object.defineProperty(ShaderMaterial.prototype, "options", {
        /**
         * Gets the options used to compile the shader.
         * They can be modified to trigger a new compilation
         */
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the current class name of the material e.g. "ShaderMaterial"
     * Mainly use in serialization.
     * @returns the class name
     */
    ShaderMaterial.prototype.getClassName = function () {
        return "ShaderMaterial";
    };
    /**
     * Specifies if the material will require alpha blending
     * @returns a boolean specifying if alpha blending is needed
     */
    ShaderMaterial.prototype.needAlphaBlending = function () {
        return (this.alpha < 1.0) || this._options.needAlphaBlending;
    };
    /**
     * Specifies if this material should be rendered in alpha test mode
     * @returns a boolean specifying if an alpha test is needed.
     */
    ShaderMaterial.prototype.needAlphaTesting = function () {
        return this._options.needAlphaTesting;
    };
    ShaderMaterial.prototype._checkUniform = function (uniformName) {
        if (this._options.uniforms.indexOf(uniformName) === -1) {
            this._options.uniforms.push(uniformName);
        }
    };
    /**
     * Set a texture in the shader.
     * @param name Define the name of the uniform samplers as defined in the shader
     * @param texture Define the texture to bind to this sampler
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setTexture = function (name, texture) {
        if (this._options.samplers.indexOf(name) === -1) {
            this._options.samplers.push(name);
        }
        this._textures[name] = texture;
        return this;
    };
    /**
     * Set a texture array in the shader.
     * @param name Define the name of the uniform sampler array as defined in the shader
     * @param textures Define the list of textures to bind to this sampler
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setTextureArray = function (name, textures) {
        if (this._options.samplers.indexOf(name) === -1) {
            this._options.samplers.push(name);
        }
        this._checkUniform(name);
        this._textureArrays[name] = textures;
        return this;
    };
    /**
     * Set a float in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setFloat = function (name, value) {
        this._checkUniform(name);
        this._floats[name] = value;
        return this;
    };
    /**
     * Set a int in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setInt = function (name, value) {
        this._checkUniform(name);
        this._ints[name] = value;
        return this;
    };
    /**
     * Set an array of floats in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setFloats = function (name, value) {
        this._checkUniform(name);
        this._floatsArrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Color3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor3 = function (name, value) {
        this._checkUniform(name);
        this._colors3[name] = value;
        return this;
    };
    /**
     * Set a vec3 array in the shader from a Color3 array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor3Array = function (name, value) {
        this._checkUniform(name);
        this._colors3Arrays[name] = value.reduce(function (arr, color) {
            color.toArray(arr, arr.length);
            return arr;
        }, []);
        return this;
    };
    /**
     * Set a vec4 in the shader from a Color4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor4 = function (name, value) {
        this._checkUniform(name);
        this._colors4[name] = value;
        return this;
    };
    /**
     * Set a vec2 in the shader from a Vector2.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Vector3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3[name] = value;
        return this;
    };
    /**
     * Set a vec4 in the shader from a Vector4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector4 = function (name, value) {
        this._checkUniform(name);
        this._vectors4[name] = value;
        return this;
    };
    /**
     * Set a mat4 in the shader from a Matrix.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix = function (name, value) {
        this._checkUniform(name);
        this._matrices[name] = value;
        return this;
    };
    /**
     * Set a mat3 in the shader from a Float32Array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix3x3 = function (name, value) {
        this._checkUniform(name);
        this._matrices3x3[name] = value;
        return this;
    };
    /**
     * Set a mat2 in the shader from a Float32Array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix2x2 = function (name, value) {
        this._checkUniform(name);
        this._matrices2x2[name] = value;
        return this;
    };
    /**
     * Set a vec2 array in the shader from a number array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setArray2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2Arrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 array in the shader from a number array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setArray3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3Arrays[name] = value;
        return this;
    };
    ShaderMaterial.prototype._checkCache = function (mesh, useInstances) {
        if (!mesh) {
            return true;
        }
        if (this._effect && (this._effect.defines.indexOf("#define INSTANCES") !== -1) !== useInstances) {
            return false;
        }
        return false;
    };
    /**
     * Specifies that the submesh is ready to be used
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    ShaderMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        return this.isReady(mesh, useInstances);
    };
    /**
     * Checks if the material is ready to render the requested mesh
     * @param mesh Define the mesh to render
     * @param useInstances Define whether or not the material is used with instances
     * @returns true if ready, otherwise false
     */
    ShaderMaterial.prototype.isReady = function (mesh, useInstances) {
        var scene = this.getScene();
        var engine = scene.getEngine();
        if (!this.checkReadyOnEveryCall) {
            if (this._renderId === scene.getRenderId()) {
                if (this._checkCache(mesh, useInstances)) {
                    return true;
                }
            }
        }
        // Instances
        var defines = [];
        var attribs = [];
        var fallbacks = new EffectFallbacks();
        for (var index = 0; index < this._options.defines.length; index++) {
            defines.push(this._options.defines[index]);
        }
        for (var index = 0; index < this._options.attributes.length; index++) {
            attribs.push(this._options.attributes[index]);
        }
        if (mesh && mesh.isVerticesDataPresent(VertexBuffer.ColorKind)) {
            attribs.push(VertexBuffer.ColorKind);
            defines.push("#define VERTEXCOLOR");
        }
        if (useInstances) {
            defines.push("#define INSTANCES");
            MaterialHelper.PrepareAttributesForInstances(attribs, defines);
        }
        // Bones
        if (mesh && mesh.useBones && mesh.computeBonesUsingShaders && mesh.skeleton) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            var skeleton = mesh.skeleton;
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            fallbacks.addCPUSkinningFallback(0, mesh);
            if (skeleton.isUsingTextureForMatrices) {
                defines.push("#define BONETEXTURE");
                if (this._options.uniforms.indexOf("boneTextureWidth") === -1) {
                    this._options.uniforms.push("boneTextureWidth");
                }
                if (this._options.samplers.indexOf("boneSampler") === -1) {
                    this._options.samplers.push("boneSampler");
                }
            }
            else {
                defines.push("#define BonesPerMesh " + (skeleton.bones.length + 1));
                if (this._options.uniforms.indexOf("mBones") === -1) {
                    this._options.uniforms.push("mBones");
                }
            }
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Textures
        for (var name in this._textures) {
            if (!this._textures[name].isReady()) {
                return false;
            }
        }
        // Alpha test
        if (mesh && this._shouldTurnAlphaTestOn(mesh)) {
            defines.push("#define ALPHATEST");
        }
        var previousEffect = this._effect;
        var join = defines.join("\n");
        this._effect = engine.createEffect(this._shaderPath, {
            attributes: attribs,
            uniformsNames: this._options.uniforms,
            uniformBuffersNames: this._options.uniformBuffers,
            samplers: this._options.samplers,
            defines: join,
            fallbacks: fallbacks,
            onCompiled: this.onCompiled,
            onError: this.onError
        }, engine);
        if (!this._effect.isReady()) {
            return false;
        }
        if (previousEffect !== this._effect) {
            scene.resetCachedMaterial();
        }
        this._renderId = scene.getRenderId();
        return true;
    };
    /**
     * Binds the world matrix to the material
     * @param world defines the world transformation matrix
     */
    ShaderMaterial.prototype.bindOnlyWorldMatrix = function (world) {
        var scene = this.getScene();
        if (!this._effect) {
            return;
        }
        if (this._options.uniforms.indexOf("world") !== -1) {
            this._effect.setMatrix("world", world);
        }
        if (this._options.uniforms.indexOf("worldView") !== -1) {
            world.multiplyToRef(scene.getViewMatrix(), this._cachedWorldViewMatrix);
            this._effect.setMatrix("worldView", this._cachedWorldViewMatrix);
        }
        if (this._options.uniforms.indexOf("worldViewProjection") !== -1) {
            this._effect.setMatrix("worldViewProjection", world.multiply(scene.getTransformMatrix()));
        }
    };
    /**
     * Binds the material to the mesh
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh to bind the material to
     */
    ShaderMaterial.prototype.bind = function (world, mesh) {
        // Std values
        this.bindOnlyWorldMatrix(world);
        if (this._effect && this.getScene().getCachedMaterial() !== this) {
            if (this._options.uniforms.indexOf("view") !== -1) {
                this._effect.setMatrix("view", this.getScene().getViewMatrix());
            }
            if (this._options.uniforms.indexOf("projection") !== -1) {
                this._effect.setMatrix("projection", this.getScene().getProjectionMatrix());
            }
            if (this._options.uniforms.indexOf("viewProjection") !== -1) {
                this._effect.setMatrix("viewProjection", this.getScene().getTransformMatrix());
            }
            // Bones
            MaterialHelper.BindBonesParameters(mesh, this._effect);
            var name;
            // Texture
            for (name in this._textures) {
                this._effect.setTexture(name, this._textures[name]);
            }
            // Texture arrays
            for (name in this._textureArrays) {
                this._effect.setTextureArray(name, this._textureArrays[name]);
            }
            // Int
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
            for (name in this._colors3Arrays) {
                this._effect.setArray3(name, this._colors3Arrays[name]);
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
            // Vector4
            for (name in this._vectors4) {
                this._effect.setVector4(name, this._vectors4[name]);
            }
            // Matrix
            for (name in this._matrices) {
                this._effect.setMatrix(name, this._matrices[name]);
            }
            // Matrix 3x3
            for (name in this._matrices3x3) {
                this._effect.setMatrix3x3(name, this._matrices3x3[name]);
            }
            // Matrix 2x2
            for (name in this._matrices2x2) {
                this._effect.setMatrix2x2(name, this._matrices2x2[name]);
            }
            // Vector2Array
            for (name in this._vectors2Arrays) {
                this._effect.setArray2(name, this._vectors2Arrays[name]);
            }
            // Vector3Array
            for (name in this._vectors3Arrays) {
                this._effect.setArray3(name, this._vectors3Arrays[name]);
            }
        }
        this._afterBind(mesh);
    };
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    ShaderMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        for (var name in this._textures) {
            activeTextures.push(this._textures[name]);
        }
        for (var name in this._textureArrays) {
            var array = this._textureArrays[name];
            for (var index = 0; index < array.length; index++) {
                activeTextures.push(array[index]);
            }
        }
        return activeTextures;
    };
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    ShaderMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        for (var name in this._textures) {
            if (this._textures[name] === texture) {
                return true;
            }
        }
        for (var name in this._textureArrays) {
            var array = this._textureArrays[name];
            for (var index = 0; index < array.length; index++) {
                if (array[index] === texture) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Makes a duplicate of the material, and gives it a new name
     * @param name defines the new name for the duplicated material
     * @returns the cloned material
     */
    ShaderMaterial.prototype.clone = function (name) {
        var newShaderMaterial = new ShaderMaterial(name, this.getScene(), this._shaderPath, this._options);
        return newShaderMaterial;
    };
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     * @param notBoundToMesh specifies if the material that is being disposed is known to be not bound to any mesh
     */
    ShaderMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        if (forceDisposeTextures) {
            var name;
            for (name in this._textures) {
                this._textures[name].dispose();
            }
            for (name in this._textureArrays) {
                var array = this._textureArrays[name];
                for (var index = 0; index < array.length; index++) {
                    array[index].dispose();
                }
            }
        }
        this._textures = {};
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
    };
    /**
     * Serializes this material in a JSON representation
     * @returns the serialized material object
     */
    ShaderMaterial.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.ShaderMaterial";
        serializationObject.options = this._options;
        serializationObject.shaderPath = this._shaderPath;
        var name;
        // Texture
        serializationObject.textures = {};
        for (name in this._textures) {
            serializationObject.textures[name] = this._textures[name].serialize();
        }
        // Texture arrays
        serializationObject.textureArrays = {};
        for (name in this._textureArrays) {
            serializationObject.textureArrays[name] = [];
            var array = this._textureArrays[name];
            for (var index = 0; index < array.length; index++) {
                serializationObject.textureArrays[name].push(array[index].serialize());
            }
        }
        // Float
        serializationObject.floats = {};
        for (name in this._floats) {
            serializationObject.floats[name] = this._floats[name];
        }
        // Float s
        serializationObject.FloatArrays = {};
        for (name in this._floatsArrays) {
            serializationObject.FloatArrays[name] = this._floatsArrays[name];
        }
        // Color3
        serializationObject.colors3 = {};
        for (name in this._colors3) {
            serializationObject.colors3[name] = this._colors3[name].asArray();
        }
        // Color3 array
        serializationObject.colors3Arrays = {};
        for (name in this._colors3Arrays) {
            serializationObject.colors3Arrays[name] = this._colors3Arrays[name];
        }
        // Color4
        serializationObject.colors4 = {};
        for (name in this._colors4) {
            serializationObject.colors4[name] = this._colors4[name].asArray();
        }
        // Vector2
        serializationObject.vectors2 = {};
        for (name in this._vectors2) {
            serializationObject.vectors2[name] = this._vectors2[name].asArray();
        }
        // Vector3
        serializationObject.vectors3 = {};
        for (name in this._vectors3) {
            serializationObject.vectors3[name] = this._vectors3[name].asArray();
        }
        // Vector4
        serializationObject.vectors4 = {};
        for (name in this._vectors4) {
            serializationObject.vectors4[name] = this._vectors4[name].asArray();
        }
        // Matrix
        serializationObject.matrices = {};
        for (name in this._matrices) {
            serializationObject.matrices[name] = this._matrices[name].asArray();
        }
        // Matrix 3x3
        serializationObject.matrices3x3 = {};
        for (name in this._matrices3x3) {
            serializationObject.matrices3x3[name] = this._matrices3x3[name];
        }
        // Matrix 2x2
        serializationObject.matrices2x2 = {};
        for (name in this._matrices2x2) {
            serializationObject.matrices2x2[name] = this._matrices2x2[name];
        }
        // Vector2Array
        serializationObject.vectors2Arrays = {};
        for (name in this._vectors2Arrays) {
            serializationObject.vectors2Arrays[name] = this._vectors2Arrays[name];
        }
        // Vector3Array
        serializationObject.vectors3Arrays = {};
        for (name in this._vectors3Arrays) {
            serializationObject.vectors3Arrays[name] = this._vectors3Arrays[name];
        }
        return serializationObject;
    };
    /**
     * Creates a shader material from parsed shader material data
     * @param source defines the JSON represnetation of the material
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new material
     */
    ShaderMaterial.Parse = function (source, scene, rootUrl) {
        var material = SerializationHelper.Parse(function () { return new ShaderMaterial(source.name, scene, source.shaderPath, source.options); }, source, scene, rootUrl);
        var name;
        // Texture
        for (name in source.textures) {
            material.setTexture(name, Texture.Parse(source.textures[name], scene, rootUrl));
        }
        // Texture arrays
        for (name in source.textureArrays) {
            var array = source.textureArrays[name];
            var textureArray = new Array();
            for (var index = 0; index < array.length; index++) {
                textureArray.push(Texture.Parse(array[index], scene, rootUrl));
            }
            material.setTextureArray(name, textureArray);
        }
        // Float
        for (name in source.floats) {
            material.setFloat(name, source.floats[name]);
        }
        // Float s
        for (name in source.floatsArrays) {
            material.setFloats(name, source.floatsArrays[name]);
        }
        // Color3
        for (name in source.colors3) {
            material.setColor3(name, Color3.FromArray(source.colors3[name]));
        }
        // Color3 arrays
        for (name in source.colors3Arrays) {
            var colors = source.colors3Arrays[name].reduce(function (arr, num, i) {
                if (i % 3 === 0) {
                    arr.push([num]);
                }
                else {
                    arr[arr.length - 1].push(num);
                }
                return arr;
            }, []).map(function (color) { return Color3.FromArray(color); });
            material.setColor3Array(name, colors);
        }
        // Color4
        for (name in source.colors4) {
            material.setColor4(name, Color4.FromArray(source.colors4[name]));
        }
        // Vector2
        for (name in source.vectors2) {
            material.setVector2(name, Vector2.FromArray(source.vectors2[name]));
        }
        // Vector3
        for (name in source.vectors3) {
            material.setVector3(name, Vector3.FromArray(source.vectors3[name]));
        }
        // Vector4
        for (name in source.vectors4) {
            material.setVector4(name, Vector4.FromArray(source.vectors4[name]));
        }
        // Matrix
        for (name in source.matrices) {
            material.setMatrix(name, Matrix.FromArray(source.matrices[name]));
        }
        // Matrix 3x3
        for (name in source.matrices3x3) {
            material.setMatrix3x3(name, source.matrices3x3[name]);
        }
        // Matrix 2x2
        for (name in source.matrices2x2) {
            material.setMatrix2x2(name, source.matrices2x2[name]);
        }
        // Vector2Array
        for (name in source.vectors2Arrays) {
            material.setArray2(name, source.vectors2Arrays[name]);
        }
        // Vector3Array
        for (name in source.vectors3Arrays) {
            material.setArray3(name, source.vectors3Arrays[name]);
        }
        return material;
    };
    return ShaderMaterial;
}(Material));
_TypeStore.RegisteredTypes["BABYLON.ShaderMaterial"] = ShaderMaterial;

/**
 * Class used to represent data loading progression
 */
var SceneLoaderProgressEvent = /** @class */ (function () {
    /**
     * Create a new progress event
     * @param lengthComputable defines if data length to load can be evaluated
     * @param loaded defines the loaded data length
     * @param total defines the data length to load
     */
    function SceneLoaderProgressEvent(
    /** defines if data length to load can be evaluated */
    lengthComputable, 
    /** defines the loaded data length */
    loaded, 
    /** defines the data length to load */
    total) {
        this.lengthComputable = lengthComputable;
        this.loaded = loaded;
        this.total = total;
    }
    /**
     * Creates a new SceneLoaderProgressEvent from a ProgressEvent
     * @param event defines the source event
     * @returns a new SceneLoaderProgressEvent
     */
    SceneLoaderProgressEvent.FromProgressEvent = function (event) {
        return new SceneLoaderProgressEvent(event.lengthComputable, event.loaded, event.total);
    };
    return SceneLoaderProgressEvent;
}());
/**
 * Class used to load scene from various file formats using registered plugins
 * @see http://doc.babylonjs.com/how_to/load_from_any_file_type
 */
var SceneLoader = /** @class */ (function () {
    function SceneLoader() {
    }
    Object.defineProperty(SceneLoader, "ForceFullSceneLoadingForIncremental", {
        /**
         * Gets or sets a boolean indicating if entire scene must be loaded even if scene contains incremental data
         */
        get: function () {
            return SceneLoaderFlags.ForceFullSceneLoadingForIncremental;
        },
        set: function (value) {
            SceneLoaderFlags.ForceFullSceneLoadingForIncremental = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "ShowLoadingScreen", {
        /**
         * Gets or sets a boolean indicating if loading screen must be displayed while loading a scene
         */
        get: function () {
            return SceneLoaderFlags.ShowLoadingScreen;
        },
        set: function (value) {
            SceneLoaderFlags.ShowLoadingScreen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "loggingLevel", {
        /**
         * Defines the current logging level (while loading the scene)
         * @ignorenaming
         */
        get: function () {
            return SceneLoaderFlags.loggingLevel;
        },
        set: function (value) {
            SceneLoaderFlags.loggingLevel = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SceneLoader, "CleanBoneMatrixWeights", {
        /**
         * Gets or set a boolean indicating if matrix weights must be cleaned upon loading
         */
        get: function () {
            return SceneLoaderFlags.CleanBoneMatrixWeights;
        },
        set: function (value) {
            SceneLoaderFlags.CleanBoneMatrixWeights = value;
        },
        enumerable: true,
        configurable: true
    });
    SceneLoader._getDefaultPlugin = function () {
        return SceneLoader._registeredPlugins[".babylon"];
    };
    SceneLoader._getPluginForExtension = function (extension) {
        var registeredPlugin = SceneLoader._registeredPlugins[extension];
        if (registeredPlugin) {
            return registeredPlugin;
        }
        Logger.Warn("Unable to find a plugin to load " + extension + " files. Trying to use .babylon default plugin. To load from a specific filetype (eg. gltf) see: http://doc.babylonjs.com/how_to/load_from_any_file_type");
        return SceneLoader._getDefaultPlugin();
    };
    SceneLoader._getPluginForDirectLoad = function (data) {
        for (var extension in SceneLoader._registeredPlugins) {
            var plugin = SceneLoader._registeredPlugins[extension].plugin;
            if (plugin.canDirectLoad && plugin.canDirectLoad(data)) {
                return SceneLoader._registeredPlugins[extension];
            }
        }
        return SceneLoader._getDefaultPlugin();
    };
    SceneLoader._getPluginForFilename = function (sceneFilename) {
        var queryStringPosition = sceneFilename.indexOf("?");
        if (queryStringPosition !== -1) {
            sceneFilename = sceneFilename.substring(0, queryStringPosition);
        }
        var dotPosition = sceneFilename.lastIndexOf(".");
        var extension = sceneFilename.substring(dotPosition, sceneFilename.length).toLowerCase();
        return SceneLoader._getPluginForExtension(extension);
    };
    // use babylon file loader directly if sceneFilename is prefixed with "data:"
    SceneLoader._getDirectLoad = function (sceneFilename) {
        if (sceneFilename.substr(0, 5) === "data:") {
            return sceneFilename.substr(5);
        }
        return null;
    };
    SceneLoader._loadData = function (fileInfo, scene, onSuccess, onProgress, onError, onDispose, pluginExtension) {
        var directLoad = SceneLoader._getDirectLoad(fileInfo.name);
        var registeredPlugin = pluginExtension ? SceneLoader._getPluginForExtension(pluginExtension) : (directLoad ? SceneLoader._getPluginForDirectLoad(fileInfo.name) : SceneLoader._getPluginForFilename(fileInfo.name));
        var plugin;
        if (registeredPlugin.plugin.createPlugin) {
            plugin = registeredPlugin.plugin.createPlugin();
        }
        else {
            plugin = registeredPlugin.plugin;
        }
        if (!plugin) {
            throw "The loader plugin corresponding to the file type you are trying to load has not been found. If using es6, please import the plugin you wish to use before.";
        }
        var useArrayBuffer = registeredPlugin.isBinary;
        var offlineProvider;
        SceneLoader.OnPluginActivatedObservable.notifyObservers(plugin);
        var dataCallback = function (data, responseURL) {
            if (scene.isDisposed) {
                onError("Scene has been disposed");
                return;
            }
            scene.offlineProvider = offlineProvider;
            onSuccess(plugin, data, responseURL);
        };
        var request = null;
        var pluginDisposed = false;
        var onDisposeObservable = plugin.onDisposeObservable;
        if (onDisposeObservable) {
            onDisposeObservable.add(function () {
                pluginDisposed = true;
                if (request) {
                    request.abort();
                    request = null;
                }
                onDispose();
            });
        }
        var manifestChecked = function () {
            if (pluginDisposed) {
                return;
            }
            request = Tools.LoadFile(fileInfo.url, dataCallback, onProgress ? function (event) {
                onProgress(SceneLoaderProgressEvent.FromProgressEvent(event));
            } : undefined, offlineProvider, useArrayBuffer, function (request, exception) {
                onError("Failed to load scene." + (exception ? " " + exception.message : ""), exception);
            });
        };
        if (directLoad) {
            dataCallback(directLoad);
            return plugin;
        }
        var file = fileInfo.file || FilesInputStore.FilesToLoad[fileInfo.name.toLowerCase()];
        if (fileInfo.rootUrl.indexOf("file:") === -1 || (fileInfo.rootUrl.indexOf("file:") !== -1 && !file)) {
            var engine = scene.getEngine();
            var canUseOfflineSupport = engine.enableOfflineSupport;
            if (canUseOfflineSupport) {
                // Also check for exceptions
                var exceptionFound = false;
                for (var _i = 0, _a = scene.disableOfflineSupportExceptionRules; _i < _a.length; _i++) {
                    var regex = _a[_i];
                    if (regex.test(fileInfo.url)) {
                        exceptionFound = true;
                        break;
                    }
                }
                canUseOfflineSupport = !exceptionFound;
            }
            if (canUseOfflineSupport && Engine.OfflineProviderFactory) {
                // Checking if a manifest file has been set for this scene and if offline mode has been requested
                offlineProvider = Engine.OfflineProviderFactory(fileInfo.url, manifestChecked, engine.disableManifestCheck);
            }
            else {
                manifestChecked();
            }
        }
        // Loading file from disk via input file or drag'n'drop
        else {
            if (file) {
                request = Tools.ReadFile(file, dataCallback, onProgress, useArrayBuffer);
            }
            else {
                onError("Unable to find file named " + fileInfo.name);
            }
        }
        return plugin;
    };
    SceneLoader._getFileInfo = function (rootUrl, sceneFilename) {
        var url;
        var name;
        var file = null;
        if (!sceneFilename) {
            url = rootUrl;
            name = Tools.GetFilename(rootUrl);
            rootUrl = Tools.GetFolderPath(rootUrl);
        }
        else if (sceneFilename.name) {
            var sceneFile = sceneFilename;
            url = rootUrl + sceneFile.name;
            name = sceneFile.name;
            file = sceneFile;
        }
        else {
            var filename = sceneFilename;
            if (filename.substr(0, 1) === "/") {
                Tools.Error("Wrong sceneFilename parameter");
                return null;
            }
            url = rootUrl + filename;
            name = filename;
        }
        return {
            url: url,
            rootUrl: rootUrl,
            name: name,
            file: file
        };
    };
    // Public functions
    /**
     * Gets a plugin that can load the given extension
     * @param extension defines the extension to load
     * @returns a plugin or null if none works
     */
    SceneLoader.GetPluginForExtension = function (extension) {
        return SceneLoader._getPluginForExtension(extension).plugin;
    };
    /**
     * Gets a boolean indicating that the given extension can be loaded
     * @param extension defines the extension to load
     * @returns true if the extension is supported
     */
    SceneLoader.IsPluginForExtensionAvailable = function (extension) {
        return !!SceneLoader._registeredPlugins[extension];
    };
    /**
     * Adds a new plugin to the list of registered plugins
     * @param plugin defines the plugin to add
     */
    SceneLoader.RegisterPlugin = function (plugin) {
        if (typeof plugin.extensions === "string") {
            var extension = plugin.extensions;
            SceneLoader._registeredPlugins[extension.toLowerCase()] = {
                plugin: plugin,
                isBinary: false
            };
        }
        else {
            var extensions = plugin.extensions;
            Object.keys(extensions).forEach(function (extension) {
                SceneLoader._registeredPlugins[extension.toLowerCase()] = {
                    plugin: plugin,
                    isBinary: extensions[extension].isBinary
                };
            });
        }
    };
    /**
     * Import meshes into a scene
     * @param meshNames an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene the instance of BABYLON.Scene to append to
     * @param onSuccess a callback with a list of imported meshes, particleSystems, and skeletons when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.ImportMesh = function (meshNames, rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to import mesh to");
            return null;
        }
        var fileInfo = SceneLoader._getFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
        };
        var errorHandler = function (message, exception) {
            var errorMessage = "Unable to import meshes from " + fileInfo.url + ": " + message;
            if (onError) {
                onError(scene, errorMessage, exception);
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress ? function (event) {
            try {
                onProgress(event);
            }
            catch (e) {
                errorHandler("Error in onProgress callback", e);
            }
        } : undefined;
        var successHandler = function (meshes, particleSystems, skeletons, animationGroups) {
            scene.importedMeshesFiles.push(fileInfo.url);
            if (onSuccess) {
                try {
                    onSuccess(meshes, particleSystems, skeletons, animationGroups);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback", e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._loadData(fileInfo, scene, function (plugin, data, responseURL) {
            if (plugin.rewriteRootURL) {
                fileInfo.rootUrl = plugin.rewriteRootURL(fileInfo.rootUrl, responseURL);
            }
            if (plugin.importMesh) {
                var syncedPlugin = plugin;
                var meshes = new Array();
                var particleSystems = new Array();
                var skeletons = new Array();
                if (!syncedPlugin.importMesh(meshNames, scene, data, fileInfo.rootUrl, meshes, particleSystems, skeletons, errorHandler)) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler(meshes, particleSystems, skeletons, []);
            }
            else {
                var asyncedPlugin = plugin;
                asyncedPlugin.importMeshAsync(meshNames, scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name).then(function (result) {
                    scene.loadingPluginName = plugin.name;
                    successHandler(result.meshes, result.particleSystems, result.skeletons, result.animationGroups);
                }).catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Import meshes into a scene
     * @param meshNames an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene the instance of BABYLON.Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded list of imported meshes, particle systems, skeletons, and animation groups
     */
    SceneLoader.ImportMeshAsync = function (meshNames, rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.ImportMesh(meshNames, rootUrl, sceneFilename, scene, function (meshes, particleSystems, skeletons, animationGroups) {
                resolve({
                    meshes: meshes,
                    particleSystems: particleSystems,
                    skeletons: skeletons,
                    animationGroups: animationGroups
                });
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Load a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param engine is the instance of BABYLON.Engine to use to create the scene
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.Load = function (rootUrl, sceneFilename, engine, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (engine === void 0) { engine = EngineStore.LastCreatedEngine; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!engine) {
            Tools.Error("No engine available");
            return null;
        }
        return SceneLoader.Append(rootUrl, sceneFilename, new Scene(engine), onSuccess, onProgress, onError, pluginExtension);
    };
    /**
     * Load a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param engine is the instance of BABYLON.Engine to use to create the scene
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded scene
     */
    SceneLoader.LoadAsync = function (rootUrl, sceneFilename, engine, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (engine === void 0) { engine = EngineStore.LastCreatedEngine; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.Load(rootUrl, sceneFilename, engine, function (scene) {
                resolve(scene);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Append a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.Append = function (rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to append to");
            return null;
        }
        var fileInfo = SceneLoader._getFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        if (SceneLoader.ShowLoadingScreen) {
            scene.getEngine().displayLoadingUI();
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
            scene.getEngine().hideLoadingUI();
        };
        var errorHandler = function (message, exception) {
            var errorMessage = "Unable to load from " + fileInfo.url + (message ? ": " + message : "");
            if (onError) {
                onError(scene, errorMessage, exception);
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress ? function (event) {
            try {
                onProgress(event);
            }
            catch (e) {
                errorHandler("Error in onProgress callback", e);
            }
        } : undefined;
        var successHandler = function () {
            if (onSuccess) {
                try {
                    onSuccess(scene);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback", e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._loadData(fileInfo, scene, function (plugin, data) {
            if (plugin.load) {
                var syncedPlugin = plugin;
                if (!syncedPlugin.load(scene, data, fileInfo.rootUrl, errorHandler)) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler();
            }
            else {
                var asyncedPlugin = plugin;
                asyncedPlugin.loadAsync(scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name).then(function () {
                    scene.loadingPluginName = plugin.name;
                    successHandler();
                }).catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
            if (SceneLoader.ShowLoadingScreen) {
                scene.executeWhenReady(function () {
                    scene.getEngine().hideLoadingUI();
                });
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Append a scene
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The given scene
     */
    SceneLoader.AppendAsync = function (rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.Append(rootUrl, sceneFilename, scene, function (scene) {
                resolve(scene);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * Load a scene into an asset container
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     * @param scene is the instance of BABYLON.Scene to append to (default: last created scene)
     * @param onSuccess a callback with the scene when import succeeds
     * @param onProgress a callback with a progress event for each file being loaded
     * @param onError a callback with the scene, a message, and possibly an exception when import fails
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded plugin
     */
    SceneLoader.LoadAssetContainer = function (rootUrl, sceneFilename, scene, onSuccess, onProgress, onError, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onSuccess === void 0) { onSuccess = null; }
        if (onProgress === void 0) { onProgress = null; }
        if (onError === void 0) { onError = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        if (!scene) {
            Logger.Error("No scene available to load asset container to");
            return null;
        }
        var fileInfo = SceneLoader._getFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }
        var loadingToken = {};
        scene._addPendingData(loadingToken);
        var disposeHandler = function () {
            scene._removePendingData(loadingToken);
        };
        var errorHandler = function (message, exception) {
            var errorMessage = "Unable to load assets from " + fileInfo.url + (message ? ": " + message : "");
            if (onError) {
                onError(scene, errorMessage, exception);
            }
            else {
                Logger.Error(errorMessage);
                // should the exception be thrown?
            }
            disposeHandler();
        };
        var progressHandler = onProgress ? function (event) {
            try {
                onProgress(event);
            }
            catch (e) {
                errorHandler("Error in onProgress callback", e);
            }
        } : undefined;
        var successHandler = function (assets) {
            if (onSuccess) {
                try {
                    onSuccess(assets);
                }
                catch (e) {
                    errorHandler("Error in onSuccess callback", e);
                }
            }
            scene._removePendingData(loadingToken);
        };
        return SceneLoader._loadData(fileInfo, scene, function (plugin, data) {
            if (plugin.loadAssetContainer) {
                var syncedPlugin = plugin;
                var assetContainer = syncedPlugin.loadAssetContainer(scene, data, fileInfo.rootUrl, errorHandler);
                if (!assetContainer) {
                    return;
                }
                scene.loadingPluginName = plugin.name;
                successHandler(assetContainer);
            }
            else if (plugin.loadAssetContainerAsync) {
                var asyncedPlugin = plugin;
                asyncedPlugin.loadAssetContainerAsync(scene, data, fileInfo.rootUrl, progressHandler, fileInfo.name).then(function (assetContainer) {
                    scene.loadingPluginName = plugin.name;
                    successHandler(assetContainer);
                }).catch(function (error) {
                    errorHandler(error.message, error);
                });
            }
            else {
                errorHandler("LoadAssetContainer is not supported by this plugin. Plugin did not provide a loadAssetContainer or loadAssetContainerAsync method.");
            }
            if (SceneLoader.ShowLoadingScreen) {
                scene.executeWhenReady(function () {
                    scene.getEngine().hideLoadingUI();
                });
            }
        }, progressHandler, errorHandler, disposeHandler, pluginExtension);
    };
    /**
     * Load a scene into an asset container
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename (e.g. http://example.com/test.glb)
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene (default: empty string)
     * @param scene is the instance of Scene to append to
     * @param onProgress a callback with a progress event for each file being loaded
     * @param pluginExtension the extension used to determine the plugin
     * @returns The loaded asset container
     */
    SceneLoader.LoadAssetContainerAsync = function (rootUrl, sceneFilename, scene, onProgress, pluginExtension) {
        if (sceneFilename === void 0) { sceneFilename = ""; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (onProgress === void 0) { onProgress = null; }
        if (pluginExtension === void 0) { pluginExtension = null; }
        return new Promise(function (resolve, reject) {
            SceneLoader.LoadAssetContainer(rootUrl, sceneFilename, scene, function (assetContainer) {
                resolve(assetContainer);
            }, onProgress, function (scene, message, exception) {
                reject(exception || new Error(message));
            }, pluginExtension);
        });
    };
    /**
     * No logging while loading
     */
    SceneLoader.NO_LOGGING = Constants.SCENELOADER_NO_LOGGING;
    /**
     * Minimal logging while loading
     */
    SceneLoader.MINIMAL_LOGGING = Constants.SCENELOADER_MINIMAL_LOGGING;
    /**
     * Summary logging while loading
     */
    SceneLoader.SUMMARY_LOGGING = Constants.SCENELOADER_SUMMARY_LOGGING;
    /**
     * Detailled logging while loading
     */
    SceneLoader.DETAILED_LOGGING = Constants.SCENELOADER_DETAILED_LOGGING;
    // Members
    /**
     * Event raised when a plugin is used to load a scene
     */
    SceneLoader.OnPluginActivatedObservable = new Observable();
    SceneLoader._registeredPlugins = {};
    return SceneLoader;
}());

/**
 * Base implementation IShadowLight
 * It groups all the common behaviour in order to reduce dupplication and better follow the DRY pattern.
 */
var ShadowLight = /** @class */ (function (_super) {
    __extends(ShadowLight, _super);
    function ShadowLight() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._needProjectionMatrixCompute = true;
        return _this;
    }
    ShadowLight.prototype._setPosition = function (value) {
        this._position = value;
    };
    Object.defineProperty(ShadowLight.prototype, "position", {
        /**
         * Sets the position the shadow will be casted from. Also use as the light position for both
         * point and spot lights.
         */
        get: function () {
            return this._position;
        },
        /**
         * Sets the position the shadow will be casted from. Also use as the light position for both
         * point and spot lights.
         */
        set: function (value) {
            this._setPosition(value);
        },
        enumerable: true,
        configurable: true
    });
    ShadowLight.prototype._setDirection = function (value) {
        this._direction = value;
    };
    Object.defineProperty(ShadowLight.prototype, "direction", {
        /**
         * In 2d mode (needCube being false), gets the direction used to cast the shadow.
         * Also use as the light direction on spot and directional lights.
         */
        get: function () {
            return this._direction;
        },
        /**
         * In 2d mode (needCube being false), sets the direction used to cast the shadow.
         * Also use as the light direction on spot and directional lights.
         */
        set: function (value) {
            this._setDirection(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShadowLight.prototype, "shadowMinZ", {
        /**
         * Gets the shadow projection clipping minimum z value.
         */
        get: function () {
            return this._shadowMinZ;
        },
        /**
         * Sets the shadow projection clipping minimum z value.
         */
        set: function (value) {
            this._shadowMinZ = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShadowLight.prototype, "shadowMaxZ", {
        /**
         * Sets the shadow projection clipping maximum z value.
         */
        get: function () {
            return this._shadowMaxZ;
        },
        /**
         * Gets the shadow projection clipping maximum z value.
         */
        set: function (value) {
            this._shadowMaxZ = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Computes the transformed information (transformedPosition and transformedDirection in World space) of the current light
     * @returns true if the information has been computed, false if it does not need to (no parenting)
     */
    ShadowLight.prototype.computeTransformedInformation = function () {
        if (this.parent && this.parent.getWorldMatrix) {
            if (!this.transformedPosition) {
                this.transformedPosition = Vector3.Zero();
            }
            Vector3.TransformCoordinatesToRef(this.position, this.parent.getWorldMatrix(), this.transformedPosition);
            // In case the direction is present.
            if (this.direction) {
                if (!this.transformedDirection) {
                    this.transformedDirection = Vector3.Zero();
                }
                Vector3.TransformNormalToRef(this.direction, this.parent.getWorldMatrix(), this.transformedDirection);
            }
            return true;
        }
        return false;
    };
    /**
     * Return the depth scale used for the shadow map.
     * @returns the depth scale.
     */
    ShadowLight.prototype.getDepthScale = function () {
        return 50.0;
    };
    /**
     * Get the direction to use to render the shadow map. In case of cube texture, the face index can be passed.
     * @param faceIndex The index of the face we are computed the direction to generate shadow
     * @returns The set direction in 2d mode otherwise the direction to the cubemap face if needCube() is true
     */
    ShadowLight.prototype.getShadowDirection = function (faceIndex) {
        return this.transformedDirection ? this.transformedDirection : this.direction;
    };
    /**
     * Returns the ShadowLight absolute position in the World.
     * @returns the position vector in world space
     */
    ShadowLight.prototype.getAbsolutePosition = function () {
        return this.transformedPosition ? this.transformedPosition : this.position;
    };
    /**
     * Sets the ShadowLight direction toward the passed target.
     * @param target The point to target in local space
     * @returns the updated ShadowLight direction
     */
    ShadowLight.prototype.setDirectionToTarget = function (target) {
        this.direction = Vector3.Normalize(target.subtract(this.position));
        return this.direction;
    };
    /**
     * Returns the light rotation in euler definition.
     * @returns the x y z rotation in local space.
     */
    ShadowLight.prototype.getRotation = function () {
        this.direction.normalize();
        var xaxis = Vector3.Cross(this.direction, Axis.Y);
        var yaxis = Vector3.Cross(xaxis, this.direction);
        return Vector3.RotationFromAxis(xaxis, yaxis, this.direction);
    };
    /**
     * Returns whether or not the shadow generation require a cube texture or a 2d texture.
     * @returns true if a cube texture needs to be use
     */
    ShadowLight.prototype.needCube = function () {
        return false;
    };
    /**
     * Detects if the projection matrix requires to be recomputed this frame.
     * @returns true if it requires to be recomputed otherwise, false.
     */
    ShadowLight.prototype.needProjectionMatrixCompute = function () {
        return this._needProjectionMatrixCompute;
    };
    /**
     * Forces the shadow generator to recompute the projection matrix even if position and direction did not changed.
     */
    ShadowLight.prototype.forceProjectionMatrixCompute = function () {
        this._needProjectionMatrixCompute = true;
    };
    /** @hidden */
    ShadowLight.prototype._initCache = function () {
        _super.prototype._initCache.call(this);
        this._cache.position = Vector3.Zero();
    };
    /** @hidden */
    ShadowLight.prototype._isSynchronized = function () {
        if (!this._cache.position.equals(this.position)) {
            return false;
        }
        return true;
    };
    /**
     * Computes the world matrix of the node
     * @param force defines if the cache version should be invalidated forcing the world matrix to be created from scratch
     * @returns the world matrix
     */
    ShadowLight.prototype.computeWorldMatrix = function (force) {
        if (!force && this.isSynchronized()) {
            this._currentRenderId = this.getScene().getRenderId();
            return this._worldMatrix;
        }
        this._updateCache();
        this._cache.position.copyFrom(this.position);
        if (!this._worldMatrix) {
            this._worldMatrix = Matrix.Identity();
        }
        Matrix.TranslationToRef(this.position.x, this.position.y, this.position.z, this._worldMatrix);
        if (this.parent && this.parent.getWorldMatrix) {
            this._worldMatrix.multiplyToRef(this.parent.getWorldMatrix(), this._worldMatrix);
            this._markSyncedWithParent();
        }
        // Cache the determinant
        this._worldMatrixDeterminantIsDirty = true;
        return this._worldMatrix;
    };
    /**
     * Gets the minZ used for shadow according to both the scene and the light.
     * @param activeCamera The camera we are returning the min for
     * @returns the depth min z
     */
    ShadowLight.prototype.getDepthMinZ = function (activeCamera) {
        return this.shadowMinZ !== undefined ? this.shadowMinZ : activeCamera.minZ;
    };
    /**
     * Gets the maxZ used for shadow according to both the scene and the light.
     * @param activeCamera The camera we are returning the max for
     * @returns the depth max z
     */
    ShadowLight.prototype.getDepthMaxZ = function (activeCamera) {
        return this.shadowMaxZ !== undefined ? this.shadowMaxZ : activeCamera.maxZ;
    };
    /**
     * Sets the shadow projection matrix in parameter to the generated projection matrix.
     * @param matrix The materix to updated with the projection information
     * @param viewMatrix The transform matrix of the light
     * @param renderList The list of mesh to render in the map
     * @returns The current light
     */
    ShadowLight.prototype.setShadowProjectionMatrix = function (matrix, viewMatrix, renderList) {
        if (this.customProjectionMatrixBuilder) {
            this.customProjectionMatrixBuilder(viewMatrix, renderList, matrix);
        }
        else {
            this._setDefaultShadowProjectionMatrix(matrix, viewMatrix, renderList);
        }
        return this;
    };
    __decorate([
        serializeAsVector3()
    ], ShadowLight.prototype, "position", null);
    __decorate([
        serializeAsVector3()
    ], ShadowLight.prototype, "direction", null);
    __decorate([
        serialize()
    ], ShadowLight.prototype, "shadowMinZ", null);
    __decorate([
        serialize()
    ], ShadowLight.prototype, "shadowMaxZ", null);
    return ShadowLight;
}(Light));

Node.AddNodeConstructor("Light_Type_1", function (name, scene) {
    return function () { return new DirectionalLight(name, Vector3.Zero(), scene); };
});
/**
 * A directional light is defined by a direction (what a surprise!).
 * The light is emitted from everywhere in the specified direction, and has an infinite range.
 * An example of a directional light is when a distance planet is lit by the apparently parallel lines of light from its sun. Light in a downward direction will light the top of an object.
 * Documentation: https://doc.babylonjs.com/babylon101/lights
 */
var DirectionalLight = /** @class */ (function (_super) {
    __extends(DirectionalLight, _super);
    /**
     * Creates a DirectionalLight object in the scene, oriented towards the passed direction (Vector3).
     * The directional light is emitted from everywhere in the given direction.
     * It can cast shadows.
     * Documentation : https://doc.babylonjs.com/babylon101/lights
     * @param name The friendly name of the light
     * @param direction The direction of the light
     * @param scene The scene the light belongs to
     */
    function DirectionalLight(name, direction, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._shadowFrustumSize = 0;
        _this._shadowOrthoScale = 0.1;
        /**
         * Automatically compute the projection matrix to best fit (including all the casters)
         * on each frame.
         */
        _this.autoUpdateExtends = true;
        // Cache
        _this._orthoLeft = Number.MAX_VALUE;
        _this._orthoRight = Number.MIN_VALUE;
        _this._orthoTop = Number.MIN_VALUE;
        _this._orthoBottom = Number.MAX_VALUE;
        _this.position = direction.scale(-1.0);
        _this.direction = direction;
        return _this;
    }
    Object.defineProperty(DirectionalLight.prototype, "shadowFrustumSize", {
        /**
         * Fix frustum size for the shadow generation. This is disabled if the value is 0.
         */
        get: function () {
            return this._shadowFrustumSize;
        },
        /**
         * Specifies a fix frustum size for the shadow generation.
         */
        set: function (value) {
            this._shadowFrustumSize = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectionalLight.prototype, "shadowOrthoScale", {
        /**
         * Gets the shadow projection scale against the optimal computed one.
         * 0.1 by default which means that the projection window is increase by 10% from the optimal size.
         * This does not impact in fixed frustum size (shadowFrustumSize being set)
         */
        get: function () {
            return this._shadowOrthoScale;
        },
        /**
         * Sets the shadow projection scale against the optimal computed one.
         * 0.1 by default which means that the projection window is increase by 10% from the optimal size.
         * This does not impact in fixed frustum size (shadowFrustumSize being set)
         */
        set: function (value) {
            this._shadowOrthoScale = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the string "DirectionalLight".
     * @return The class name
     */
    DirectionalLight.prototype.getClassName = function () {
        return "DirectionalLight";
    };
    /**
     * Returns the integer 1.
     * @return The light Type id as a constant defines in Light.LIGHTTYPEID_x
     */
    DirectionalLight.prototype.getTypeID = function () {
        return Light.LIGHTTYPEID_DIRECTIONALLIGHT;
    };
    /**
     * Sets the passed matrix "matrix" as projection matrix for the shadows cast by the light according to the passed view matrix.
     * Returns the DirectionalLight Shadow projection matrix.
     */
    DirectionalLight.prototype._setDefaultShadowProjectionMatrix = function (matrix, viewMatrix, renderList) {
        if (this.shadowFrustumSize > 0) {
            this._setDefaultFixedFrustumShadowProjectionMatrix(matrix);
        }
        else {
            this._setDefaultAutoExtendShadowProjectionMatrix(matrix, viewMatrix, renderList);
        }
    };
    /**
     * Sets the passed matrix "matrix" as fixed frustum projection matrix for the shadows cast by the light according to the passed view matrix.
     * Returns the DirectionalLight Shadow projection matrix.
     */
    DirectionalLight.prototype._setDefaultFixedFrustumShadowProjectionMatrix = function (matrix) {
        var activeCamera = this.getScene().activeCamera;
        if (!activeCamera) {
            return;
        }
        Matrix.OrthoLHToRef(this.shadowFrustumSize, this.shadowFrustumSize, this.shadowMinZ !== undefined ? this.shadowMinZ : activeCamera.minZ, this.shadowMaxZ !== undefined ? this.shadowMaxZ : activeCamera.maxZ, matrix);
    };
    /**
     * Sets the passed matrix "matrix" as auto extend projection matrix for the shadows cast by the light according to the passed view matrix.
     * Returns the DirectionalLight Shadow projection matrix.
     */
    DirectionalLight.prototype._setDefaultAutoExtendShadowProjectionMatrix = function (matrix, viewMatrix, renderList) {
        var activeCamera = this.getScene().activeCamera;
        if (!activeCamera) {
            return;
        }
        // Check extends
        if (this.autoUpdateExtends || this._orthoLeft === Number.MAX_VALUE) {
            var tempVector3 = Vector3.Zero();
            this._orthoLeft = Number.MAX_VALUE;
            this._orthoRight = Number.MIN_VALUE;
            this._orthoTop = Number.MIN_VALUE;
            this._orthoBottom = Number.MAX_VALUE;
            for (var meshIndex = 0; meshIndex < renderList.length; meshIndex++) {
                var mesh = renderList[meshIndex];
                if (!mesh) {
                    continue;
                }
                var boundingInfo = mesh.getBoundingInfo();
                var boundingBox = boundingInfo.boundingBox;
                for (var index = 0; index < boundingBox.vectorsWorld.length; index++) {
                    Vector3.TransformCoordinatesToRef(boundingBox.vectorsWorld[index], viewMatrix, tempVector3);
                    if (tempVector3.x < this._orthoLeft) {
                        this._orthoLeft = tempVector3.x;
                    }
                    if (tempVector3.y < this._orthoBottom) {
                        this._orthoBottom = tempVector3.y;
                    }
                    if (tempVector3.x > this._orthoRight) {
                        this._orthoRight = tempVector3.x;
                    }
                    if (tempVector3.y > this._orthoTop) {
                        this._orthoTop = tempVector3.y;
                    }
                }
            }
        }
        var xOffset = this._orthoRight - this._orthoLeft;
        var yOffset = this._orthoTop - this._orthoBottom;
        Matrix.OrthoOffCenterLHToRef(this._orthoLeft - xOffset * this.shadowOrthoScale, this._orthoRight + xOffset * this.shadowOrthoScale, this._orthoBottom - yOffset * this.shadowOrthoScale, this._orthoTop + yOffset * this.shadowOrthoScale, this.shadowMinZ !== undefined ? this.shadowMinZ : activeCamera.minZ, this.shadowMaxZ !== undefined ? this.shadowMaxZ : activeCamera.maxZ, matrix);
    };
    DirectionalLight.prototype._buildUniformLayout = function () {
        this._uniformBuffer.addUniform("vLightData", 4);
        this._uniformBuffer.addUniform("vLightDiffuse", 4);
        this._uniformBuffer.addUniform("vLightSpecular", 3);
        this._uniformBuffer.addUniform("shadowsInfo", 3);
        this._uniformBuffer.addUniform("depthValues", 2);
        this._uniformBuffer.create();
    };
    /**
     * Sets the passed Effect object with the DirectionalLight transformed position (or position if not parented) and the passed name.
     * @param effect The effect to update
     * @param lightIndex The index of the light in the effect to update
     * @returns The directional light
     */
    DirectionalLight.prototype.transferToEffect = function (effect, lightIndex) {
        if (this.computeTransformedInformation()) {
            this._uniformBuffer.updateFloat4("vLightData", this.transformedDirection.x, this.transformedDirection.y, this.transformedDirection.z, 1, lightIndex);
            return this;
        }
        this._uniformBuffer.updateFloat4("vLightData", this.direction.x, this.direction.y, this.direction.z, 1, lightIndex);
        return this;
    };
    /**
     * Gets the minZ used for shadow according to both the scene and the light.
     *
     * Values are fixed on directional lights as it relies on an ortho projection hence the need to convert being
     * -1 and 1 to 0 and 1 doing (depth + min) / (min + max) -> (depth + 1) / (1 + 1) -> (depth * 0.5) + 0.5.
     * @param activeCamera The camera we are returning the min for
     * @returns the depth min z
     */
    DirectionalLight.prototype.getDepthMinZ = function (activeCamera) {
        return 1;
    };
    /**
     * Gets the maxZ used for shadow according to both the scene and the light.
     *
     * Values are fixed on directional lights as it relies on an ortho projection hence the need to convert being
     * -1 and 1 to 0 and 1 doing (depth + min) / (min + max) -> (depth + 1) / (1 + 1) -> (depth * 0.5) + 0.5.
     * @param activeCamera The camera we are returning the max for
     * @returns the depth max z
     */
    DirectionalLight.prototype.getDepthMaxZ = function (activeCamera) {
        return 1;
    };
    /**
     * Prepares the list of defines specific to the light type.
     * @param defines the list of defines
     * @param lightIndex defines the index of the light for the effect
     */
    DirectionalLight.prototype.prepareLightSpecificDefines = function (defines, lightIndex) {
        defines["DIRLIGHT" + lightIndex] = true;
    };
    __decorate([
        serialize()
    ], DirectionalLight.prototype, "shadowFrustumSize", null);
    __decorate([
        serialize()
    ], DirectionalLight.prototype, "shadowOrthoScale", null);
    __decorate([
        serialize()
    ], DirectionalLight.prototype, "autoUpdateExtends", void 0);
    return DirectionalLight;
}(ShadowLight));

Node.AddNodeConstructor("Light_Type_2", function (name, scene) {
    return function () { return new SpotLight(name, Vector3.Zero(), Vector3.Zero(), 0, 0, scene); };
});
/**
 * A spot light is defined by a position, a direction, an angle, and an exponent.
 * These values define a cone of light starting from the position, emitting toward the direction.
 * The angle, in radians, defines the size (field of illumination) of the spotlight's conical beam,
 * and the exponent defines the speed of the decay of the light with distance (reach).
 * Documentation: https://doc.babylonjs.com/babylon101/lights
 */
var SpotLight = /** @class */ (function (_super) {
    __extends(SpotLight, _super);
    /**
     * Creates a SpotLight object in the scene. A spot light is a simply light oriented cone.
     * It can cast shadows.
     * Documentation : https://doc.babylonjs.com/babylon101/lights
     * @param name The light friendly name
     * @param position The position of the spot light in the scene
     * @param direction The direction of the light in the scene
     * @param angle The cone angle of the light in Radians
     * @param exponent The light decay speed with the distance from the emission spot
     * @param scene The scene the lights belongs to
     */
    function SpotLight(name, position, direction, angle, exponent, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._innerAngle = 0;
        _this._projectionTextureMatrix = Matrix.Zero();
        _this._projectionTextureLightNear = 1e-6;
        _this._projectionTextureLightFar = 1000.0;
        _this._projectionTextureUpDirection = Vector3.Up();
        _this._projectionTextureViewLightDirty = true;
        _this._projectionTextureProjectionLightDirty = true;
        _this._projectionTextureDirty = true;
        _this._projectionTextureViewTargetVector = Vector3.Zero();
        _this._projectionTextureViewLightMatrix = Matrix.Zero();
        _this._projectionTextureProjectionLightMatrix = Matrix.Zero();
        _this._projectionTextureScalingMatrix = Matrix.FromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
        _this.position = position;
        _this.direction = direction;
        _this.angle = angle;
        _this.exponent = exponent;
        return _this;
    }
    Object.defineProperty(SpotLight.prototype, "angle", {
        /**
         * Gets the cone angle of the spot light in Radians.
         */
        get: function () {
            return this._angle;
        },
        /**
         * Sets the cone angle of the spot light in Radians.
         */
        set: function (value) {
            this._angle = value;
            this._cosHalfAngle = Math.cos(value * 0.5);
            this._projectionTextureProjectionLightDirty = true;
            this.forceProjectionMatrixCompute();
            this._computeAngleValues();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "innerAngle", {
        /**
         * Only used in gltf falloff mode, this defines the angle where
         * the directional falloff will start before cutting at angle which could be seen
         * as outer angle.
         */
        get: function () {
            return this._innerAngle;
        },
        /**
         * Only used in gltf falloff mode, this defines the angle where
         * the directional falloff will start before cutting at angle which could be seen
         * as outer angle.
         */
        set: function (value) {
            this._innerAngle = value;
            this._computeAngleValues();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "shadowAngleScale", {
        /**
         * Allows scaling the angle of the light for shadow generation only.
         */
        get: function () {
            return this._shadowAngleScale;
        },
        /**
         * Allows scaling the angle of the light for shadow generation only.
         */
        set: function (value) {
            this._shadowAngleScale = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "projectionTextureMatrix", {
        /**
        * Allows reading the projecton texture
        */
        get: function () {
            return this._projectionTextureMatrix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "projectionTextureLightNear", {
        /**
         * Gets the near clip of the Spotlight for texture projection.
         */
        get: function () {
            return this._projectionTextureLightNear;
        },
        /**
         * Sets the near clip of the Spotlight for texture projection.
         */
        set: function (value) {
            this._projectionTextureLightNear = value;
            this._projectionTextureProjectionLightDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "projectionTextureLightFar", {
        /**
         * Gets the far clip of the Spotlight for texture projection.
         */
        get: function () {
            return this._projectionTextureLightFar;
        },
        /**
         * Sets the far clip of the Spotlight for texture projection.
         */
        set: function (value) {
            this._projectionTextureLightFar = value;
            this._projectionTextureProjectionLightDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "projectionTextureUpDirection", {
        /**
         * Gets the Up vector of the Spotlight for texture projection.
         */
        get: function () {
            return this._projectionTextureUpDirection;
        },
        /**
         * Sets the Up vector of the Spotlight for texture projection.
         */
        set: function (value) {
            this._projectionTextureUpDirection = value;
            this._projectionTextureProjectionLightDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpotLight.prototype, "projectionTexture", {
        /**
         * Gets the projection texture of the light.
        */
        get: function () {
            return this._projectionTexture;
        },
        /**
        * Sets the projection texture of the light.
        */
        set: function (value) {
            var _this = this;
            if (this._projectionTexture === value) {
                return;
            }
            this._projectionTexture = value;
            this._projectionTextureDirty = true;
            if (this._projectionTexture && !this._projectionTexture.isReady()) {
                var texture = this._projectionTexture;
                if (texture.onLoadObservable) {
                    texture.onLoadObservable.addOnce(function () {
                        _this._markMeshesAsLightDirty();
                    });
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the string "SpotLight".
     * @returns the class name
     */
    SpotLight.prototype.getClassName = function () {
        return "SpotLight";
    };
    /**
     * Returns the integer 2.
     * @returns The light Type id as a constant defines in Light.LIGHTTYPEID_x
     */
    SpotLight.prototype.getTypeID = function () {
        return Light.LIGHTTYPEID_SPOTLIGHT;
    };
    /**
     * Overrides the direction setter to recompute the projection texture view light Matrix.
     */
    SpotLight.prototype._setDirection = function (value) {
        _super.prototype._setDirection.call(this, value);
        this._projectionTextureViewLightDirty = true;
    };
    /**
     * Overrides the position setter to recompute the projection texture view light Matrix.
     */
    SpotLight.prototype._setPosition = function (value) {
        _super.prototype._setPosition.call(this, value);
        this._projectionTextureViewLightDirty = true;
    };
    /**
     * Sets the passed matrix "matrix" as perspective projection matrix for the shadows and the passed view matrix with the fov equal to the SpotLight angle and and aspect ratio of 1.0.
     * Returns the SpotLight.
     */
    SpotLight.prototype._setDefaultShadowProjectionMatrix = function (matrix, viewMatrix, renderList) {
        var activeCamera = this.getScene().activeCamera;
        if (!activeCamera) {
            return;
        }
        this._shadowAngleScale = this._shadowAngleScale || 1;
        var angle = this._shadowAngleScale * this._angle;
        Matrix.PerspectiveFovLHToRef(angle, 1.0, this.getDepthMinZ(activeCamera), this.getDepthMaxZ(activeCamera), matrix);
    };
    SpotLight.prototype._computeProjectionTextureViewLightMatrix = function () {
        this._projectionTextureViewLightDirty = false;
        this._projectionTextureDirty = true;
        this.position.addToRef(this.direction, this._projectionTextureViewTargetVector);
        Matrix.LookAtLHToRef(this.position, this._projectionTextureViewTargetVector, this._projectionTextureUpDirection, this._projectionTextureViewLightMatrix);
    };
    SpotLight.prototype._computeProjectionTextureProjectionLightMatrix = function () {
        this._projectionTextureProjectionLightDirty = false;
        this._projectionTextureDirty = true;
        var light_far = this.projectionTextureLightFar;
        var light_near = this.projectionTextureLightNear;
        var P = light_far / (light_far - light_near);
        var Q = -P * light_near;
        var S = 1.0 / Math.tan(this._angle / 2.0);
        var A = 1.0;
        Matrix.FromValuesToRef(S / A, 0.0, 0.0, 0.0, 0.0, S, 0.0, 0.0, 0.0, 0.0, P, 1.0, 0.0, 0.0, Q, 0.0, this._projectionTextureProjectionLightMatrix);
    };
    /**
     * Main function for light texture projection matrix computing.
     */
    SpotLight.prototype._computeProjectionTextureMatrix = function () {
        this._projectionTextureDirty = false;
        this._projectionTextureViewLightMatrix.multiplyToRef(this._projectionTextureProjectionLightMatrix, this._projectionTextureMatrix);
        this._projectionTextureMatrix.multiplyToRef(this._projectionTextureScalingMatrix, this._projectionTextureMatrix);
    };
    SpotLight.prototype._buildUniformLayout = function () {
        this._uniformBuffer.addUniform("vLightData", 4);
        this._uniformBuffer.addUniform("vLightDiffuse", 4);
        this._uniformBuffer.addUniform("vLightSpecular", 3);
        this._uniformBuffer.addUniform("vLightDirection", 3);
        this._uniformBuffer.addUniform("vLightFalloff", 4);
        this._uniformBuffer.addUniform("shadowsInfo", 3);
        this._uniformBuffer.addUniform("depthValues", 2);
        this._uniformBuffer.create();
    };
    SpotLight.prototype._computeAngleValues = function () {
        this._lightAngleScale = 1.0 / Math.max(0.001, (Math.cos(this._innerAngle * 0.5) - this._cosHalfAngle));
        this._lightAngleOffset = -this._cosHalfAngle * this._lightAngleScale;
    };
    /**
     * Sets the passed Effect object with the SpotLight transfomed position (or position if not parented) and normalized direction.
     * @param effect The effect to update
     * @param lightIndex The index of the light in the effect to update
     * @returns The spot light
     */
    SpotLight.prototype.transferToEffect = function (effect, lightIndex) {
        var normalizeDirection;
        if (this.computeTransformedInformation()) {
            this._uniformBuffer.updateFloat4("vLightData", this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z, this.exponent, lightIndex);
            normalizeDirection = Vector3.Normalize(this.transformedDirection);
        }
        else {
            this._uniformBuffer.updateFloat4("vLightData", this.position.x, this.position.y, this.position.z, this.exponent, lightIndex);
            normalizeDirection = Vector3.Normalize(this.direction);
        }
        this._uniformBuffer.updateFloat4("vLightDirection", normalizeDirection.x, normalizeDirection.y, normalizeDirection.z, this._cosHalfAngle, lightIndex);
        this._uniformBuffer.updateFloat4("vLightFalloff", this.range, this._inverseSquaredRange, this._lightAngleScale, this._lightAngleOffset, lightIndex);
        if (this.projectionTexture && this.projectionTexture.isReady()) {
            if (this._projectionTextureViewLightDirty) {
                this._computeProjectionTextureViewLightMatrix();
            }
            if (this._projectionTextureProjectionLightDirty) {
                this._computeProjectionTextureProjectionLightMatrix();
            }
            if (this._projectionTextureDirty) {
                this._computeProjectionTextureMatrix();
            }
            effect.setMatrix("textureProjectionMatrix" + lightIndex, this._projectionTextureMatrix);
            effect.setTexture("projectionLightSampler" + lightIndex, this.projectionTexture);
        }
        return this;
    };
    /**
     * Disposes the light and the associated resources.
     */
    SpotLight.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._projectionTexture) {
            this._projectionTexture.dispose();
        }
    };
    /**
     * Prepares the list of defines specific to the light type.
     * @param defines the list of defines
     * @param lightIndex defines the index of the light for the effect
     */
    SpotLight.prototype.prepareLightSpecificDefines = function (defines, lightIndex) {
        defines["SPOTLIGHT" + lightIndex] = true;
        defines["PROJECTEDLIGHTTEXTURE" + lightIndex] = this.projectionTexture && this.projectionTexture.isReady() ? true : false;
    };
    __decorate([
        serialize()
    ], SpotLight.prototype, "angle", null);
    __decorate([
        serialize()
    ], SpotLight.prototype, "innerAngle", null);
    __decorate([
        serialize()
    ], SpotLight.prototype, "shadowAngleScale", null);
    __decorate([
        serialize()
    ], SpotLight.prototype, "exponent", void 0);
    __decorate([
        serialize()
    ], SpotLight.prototype, "projectionTextureLightNear", null);
    __decorate([
        serialize()
    ], SpotLight.prototype, "projectionTextureLightFar", null);
    __decorate([
        serialize()
    ], SpotLight.prototype, "projectionTextureUpDirection", null);
    __decorate([
        serializeAsTexture("projectedLightTexture")
    ], SpotLight.prototype, "_projectionTexture", void 0);
    return SpotLight;
}(ShadowLight));

Engine.prototype._createDepthStencilCubeTexture = function (size, options) {
    var internalTexture = new InternalTexture(this, InternalTexture.DATASOURCE_UNKNOWN);
    internalTexture.isCube = true;
    if (this.webGLVersion === 1) {
        Logger.Error("Depth cube texture is not supported by WebGL 1.");
        return internalTexture;
    }
    var internalOptions = __assign({ bilinearFiltering: false, comparisonFunction: 0, generateStencil: false }, options);
    var gl = this._gl;
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, internalTexture, true);
    this._setupDepthStencilTexture(internalTexture, size, internalOptions.generateStencil, internalOptions.bilinearFiltering, internalOptions.comparisonFunction);
    // Create the depth/stencil buffer
    for (var face = 0; face < 6; face++) {
        if (internalOptions.generateStencil) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.DEPTH24_STENCIL8, size, size, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
        }
        else {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        }
    }
    this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, null);
    return internalTexture;
};
Engine.prototype._partialLoadFile = function (url, index, loadedFiles, onfinish, onErrorCallBack) {
    if (onErrorCallBack === void 0) { onErrorCallBack = null; }
    var onload = function (data) {
        loadedFiles[index] = data;
        loadedFiles._internalCount++;
        if (loadedFiles._internalCount === 6) {
            onfinish(loadedFiles);
        }
    };
    var onerror = function (request, exception) {
        if (onErrorCallBack && request) {
            onErrorCallBack(request.status + " " + request.statusText, exception);
        }
    };
    this._loadFile(url, onload, undefined, undefined, true, onerror);
};
Engine.prototype._cascadeLoadFiles = function (scene, onfinish, files, onError) {
    if (onError === void 0) { onError = null; }
    var loadedFiles = [];
    loadedFiles._internalCount = 0;
    for (var index = 0; index < 6; index++) {
        this._partialLoadFile(files[index], index, loadedFiles, onfinish, onError);
    }
};
Engine.prototype._cascadeLoadImgs = function (scene, onfinish, files, onError) {
    if (onError === void 0) { onError = null; }
    var loadedImages = [];
    loadedImages._internalCount = 0;
    for (var index = 0; index < 6; index++) {
        this._partialLoadImg(files[index], index, loadedImages, scene, onfinish, onError);
    }
};
Engine.prototype._partialLoadImg = function (url, index, loadedImages, scene, onfinish, onErrorCallBack) {
    if (onErrorCallBack === void 0) { onErrorCallBack = null; }
    var img;
    var onload = function () {
        loadedImages[index] = img;
        loadedImages._internalCount++;
        if (scene) {
            scene._removePendingData(img);
        }
        if (loadedImages._internalCount === 6) {
            onfinish(loadedImages);
        }
    };
    var onerror = function (message, exception) {
        if (scene) {
            scene._removePendingData(img);
        }
        if (onErrorCallBack) {
            onErrorCallBack(message, exception);
        }
    };
    img = Tools.LoadImage(url, onload, onerror, scene ? scene.offlineProvider : null);
    if (scene) {
        scene._addPendingData(img);
    }
};
Engine.prototype.createCubeTexture = function (rootUrl, scene, files, noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, excludeLoaders) {
    var _this = this;
    if (onLoad === void 0) { onLoad = null; }
    if (onError === void 0) { onError = null; }
    if (forcedExtension === void 0) { forcedExtension = null; }
    if (createPolynomials === void 0) { createPolynomials = false; }
    if (lodScale === void 0) { lodScale = 0; }
    if (lodOffset === void 0) { lodOffset = 0; }
    if (fallback === void 0) { fallback = null; }
    if (excludeLoaders === void 0) { excludeLoaders = []; }
    var gl = this._gl;
    var texture = fallback ? fallback : new InternalTexture(this, InternalTexture.DATASOURCE_CUBE);
    texture.isCube = true;
    texture.url = rootUrl;
    texture.generateMipMaps = !noMipmap;
    texture._lodGenerationScale = lodScale;
    texture._lodGenerationOffset = lodOffset;
    if (!this._doNotHandleContextLost) {
        texture._extension = forcedExtension;
        texture._files = files;
    }
    var lastDot = rootUrl.lastIndexOf('.');
    var extension = forcedExtension ? forcedExtension : (lastDot > -1 ? rootUrl.substring(lastDot).toLowerCase() : "");
    var loader = null;
    for (var _i = 0, _a = Engine._TextureLoaders; _i < _a.length; _i++) {
        var availableLoader = _a[_i];
        if (excludeLoaders.indexOf(availableLoader) === -1 && availableLoader.canLoad(extension, this._textureFormatInUse, fallback, false, false)) {
            loader = availableLoader;
            break;
        }
    }
    var onInternalError = function (request, exception) {
        if (loader) {
            var fallbackUrl = loader.getFallbackTextureUrl(texture.url, _this._textureFormatInUse);
            Logger.Warn(loader.constructor.name + " failed when trying to load " + texture.url + ", falling back to the next supported loader");
            if (fallbackUrl) {
                excludeLoaders.push(loader);
                _this.createCubeTexture(fallbackUrl, scene, files, noMipmap, onLoad, onError, format, extension, createPolynomials, lodScale, lodOffset, texture, excludeLoaders);
                return;
            }
        }
        if (onError && request) {
            onError(request.status + " " + request.statusText, exception);
        }
    };
    if (loader) {
        rootUrl = loader.transformUrl(rootUrl, this._textureFormatInUse);
        var onloaddata = function (data) {
            _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
            loader.loadCubeData(data, texture, createPolynomials, onLoad, onError);
        };
        if (files && files.length === 6) {
            if (loader.supportCascades) {
                this._cascadeLoadFiles(scene, onloaddata, files, onError);
            }
            else {
                if (onError) {
                    onError("Textures type does not support cascades.");
                }
                else {
                    Logger.Warn("Texture loader does not support cascades.");
                }
            }
        }
        else {
            this._loadFile(rootUrl, onloaddata, undefined, undefined, true, onInternalError);
        }
    }
    else {
        if (!files) {
            throw new Error("Cannot load cubemap because files were not defined");
        }
        this._cascadeLoadImgs(scene, function (imgs) {
            var width = _this.needPOTTextures ? Tools.GetExponentOfTwo(imgs[0].width, _this._caps.maxCubemapTextureSize) : imgs[0].width;
            var height = width;
            _this._prepareWorkingCanvas();
            if (!_this._workingCanvas || !_this._workingContext) {
                return;
            }
            _this._workingCanvas.width = width;
            _this._workingCanvas.height = height;
            var faces = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];
            _this._bindTextureDirectly(gl.TEXTURE_CUBE_MAP, texture, true);
            _this._unpackFlipY(false);
            var internalFormat = format ? _this._getInternalFormat(format) : _this._gl.RGBA;
            for (var index = 0; index < faces.length; index++) {
                if (imgs[index].width !== width || imgs[index].height !== height) {
                    _this._workingContext.drawImage(imgs[index], 0, 0, imgs[index].width, imgs[index].height, 0, 0, width, height);
                    gl.texImage2D(faces[index], 0, internalFormat, internalFormat, gl.UNSIGNED_BYTE, _this._workingCanvas);
                }
                else {
                    gl.texImage2D(faces[index], 0, internalFormat, internalFormat, gl.UNSIGNED_BYTE, imgs[index]);
                }
            }
            if (!noMipmap) {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
            _this._setCubeMapTextureParams(!noMipmap);
            texture.width = width;
            texture.height = height;
            texture.isReady = true;
            if (format) {
                texture.format = format;
            }
            texture.onLoadedObservable.notifyObservers(texture);
            texture.onLoadedObservable.clear();
            if (onLoad) {
                onLoad();
            }
        }, files, onError);
    }
    this._internalTexturesCache.push(texture);
    return texture;
};

/**
 * Class for creating a cube texture
 */
var CubeTexture = /** @class */ (function (_super) {
    __extends(CubeTexture, _super);
    /**
     * Creates a cube texture to use with reflection for instance. It can be based upon dds or six images as well
     * as prefiltered data.
     * @param rootUrl defines the url of the texture or the root name of the six images
     * @param scene defines the scene the texture is attached to
     * @param extensions defines the suffixes add to the picture name in case six images are in use like _px.jpg...
     * @param noMipmap defines if mipmaps should be created or not
     * @param files defines the six files to load for the different faces in that order: px, py, pz, nx, ny, nz
     * @param onLoad defines a callback triggered at the end of the file load if no errors occured
     * @param onError defines a callback triggered in case of error during load
     * @param format defines the internal format to use for the texture once loaded
     * @param prefiltered defines whether or not the texture is created from prefiltered data
     * @param forcedExtension defines the extensions to use (force a special type of file to load) in case it is different from the file name
     * @param createPolynomials defines whether or not to create polynomial harmonics from the texture data if necessary
     * @param lodScale defines the scale applied to environment texture. This manages the range of LOD level used for IBL according to the roughness
     * @param lodOffset defines the offset applied to environment texture. This manages first LOD level used for IBL according to the roughness
     * @return the cube texture
     */
    function CubeTexture(rootUrl, scene, extensions, noMipmap, files, onLoad, onError, format, prefiltered, forcedExtension, createPolynomials, lodScale, lodOffset) {
        if (extensions === void 0) { extensions = null; }
        if (noMipmap === void 0) { noMipmap = false; }
        if (files === void 0) { files = null; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (format === void 0) { format = Constants.TEXTUREFORMAT_RGBA; }
        if (prefiltered === void 0) { prefiltered = false; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (createPolynomials === void 0) { createPolynomials = false; }
        if (lodScale === void 0) { lodScale = 0.8; }
        if (lodOffset === void 0) { lodOffset = 0; }
        var _this = _super.call(this, scene) || this;
        /**
         * Gets or sets the center of the bounding box associated with the cube texture.
         * It must define where the camera used to render the texture was set
         * @see http://doc.babylonjs.com/how_to/reflect#using-local-cubemap-mode
         */
        _this.boundingBoxPosition = Vector3.Zero();
        _this._rotationY = 0;
        /** @hidden */
        _this._prefiltered = false;
        _this.name = rootUrl;
        _this.url = rootUrl;
        _this._noMipmap = noMipmap;
        _this.hasAlpha = false;
        _this._format = format;
        _this.isCube = true;
        _this._textureMatrix = Matrix.Identity();
        _this._createPolynomials = createPolynomials;
        _this.coordinatesMode = Texture.CUBIC_MODE;
        if (!rootUrl && !files) {
            return _this;
        }
        var lastDot = rootUrl.lastIndexOf(".");
        var extension = forcedExtension ? forcedExtension : (lastDot > -1 ? rootUrl.substring(lastDot).toLowerCase() : "");
        var isDDS = (extension === ".dds");
        var isEnv = (extension === ".env");
        if (isEnv) {
            _this.gammaSpace = false;
            _this._prefiltered = false;
        }
        else {
            _this._prefiltered = prefiltered;
            if (prefiltered) {
                _this.gammaSpace = false;
            }
        }
        _this._texture = _this._getFromCache(rootUrl, noMipmap);
        if (!files) {
            if (!isEnv && !isDDS && !extensions) {
                extensions = ["_px.jpg", "_py.jpg", "_pz.jpg", "_nx.jpg", "_ny.jpg", "_nz.jpg"];
            }
            files = [];
            if (extensions) {
                for (var index = 0; index < extensions.length; index++) {
                    files.push(rootUrl + extensions[index]);
                }
            }
        }
        _this._files = files;
        if (!_this._texture) {
            if (!scene.useDelayedTextureLoading) {
                if (prefiltered) {
                    _this._texture = scene.getEngine().createPrefilteredCubeTexture(rootUrl, scene, lodScale, lodOffset, onLoad, onError, format, forcedExtension, _this._createPolynomials);
                }
                else {
                    _this._texture = scene.getEngine().createCubeTexture(rootUrl, scene, files, noMipmap, onLoad, onError, _this._format, forcedExtension, false, lodScale, lodOffset);
                }
            }
            else {
                _this.delayLoadState = Constants.DELAYLOADSTATE_NOTLOADED;
            }
        }
        else if (onLoad) {
            if (_this._texture.isReady) {
                Tools.SetImmediate(function () { return onLoad(); });
            }
            else {
                _this._texture.onLoadedObservable.add(onLoad);
            }
        }
        return _this;
    }
    Object.defineProperty(CubeTexture.prototype, "boundingBoxSize", {
        /**
         * Returns the bounding box size
         * @see http://doc.babylonjs.com/how_to/reflect#using-local-cubemap-mode
         */
        get: function () {
            return this._boundingBoxSize;
        },
        /**
         * Gets or sets the size of the bounding box associated with the cube texture
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
    Object.defineProperty(CubeTexture.prototype, "rotationY", {
        /**
         * Gets texture matrix rotation angle around Y axis radians.
         */
        get: function () {
            return this._rotationY;
        },
        /**
         * Sets texture matrix rotation angle around Y axis in radians.
         */
        set: function (value) {
            this._rotationY = value;
            this.setReflectionTextureMatrix(Matrix.RotationY(this._rotationY));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CubeTexture.prototype, "noMipmap", {
        /**
         * Are mip maps generated for this texture or not.
         */
        get: function () {
            return this._noMipmap;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a cube texture from an array of image urls
     * @param files defines an array of image urls
     * @param scene defines the hosting scene
     * @param noMipmap specifies if mip maps are not used
     * @returns a cube texture
     */
    CubeTexture.CreateFromImages = function (files, scene, noMipmap) {
        var rootUrlKey = "";
        files.forEach(function (url) { return rootUrlKey += url; });
        return new CubeTexture(rootUrlKey, scene, null, noMipmap, files);
    };
    /**
     * Creates and return a texture created from prefilterd data by tools like IBL Baker or Lys.
     * @param url defines the url of the prefiltered texture
     * @param scene defines the scene the texture is attached to
     * @param forcedExtension defines the extension of the file if different from the url
     * @param createPolynomials defines whether or not to create polynomial harmonics from the texture data if necessary
     * @return the prefiltered texture
     */
    CubeTexture.CreateFromPrefilteredData = function (url, scene, forcedExtension, createPolynomials) {
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (createPolynomials === void 0) { createPolynomials = true; }
        return new CubeTexture(url, scene, null, false, null, null, null, undefined, true, forcedExtension, createPolynomials);
    };
    Object.defineProperty(CubeTexture.prototype, "isPrefiltered", {
        /**
         * Gets a boolean indicating if the cube texture contains prefiltered mips (used to simulate roughness with PBR)
         */
        get: function () {
            return this._prefiltered;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the current class name of the texture useful for serialization or dynamic coding.
     * @returns "CubeTexture"
     */
    CubeTexture.prototype.getClassName = function () {
        return "CubeTexture";
    };
    /**
     * Update the url (and optional buffer) of this texture if url was null during construction.
     * @param url the url of the texture
     * @param forcedExtension defines the extension to use
     * @param onLoad callback called when the texture is loaded  (defaults to null)
     */
    CubeTexture.prototype.updateURL = function (url, forcedExtension, onLoad) {
        if (this.url) {
            this.releaseInternalTexture();
            this.getScene().markAllMaterialsAsDirty(Constants.MATERIAL_TextureDirtyFlag);
        }
        this.url = url;
        this.delayLoadState = Constants.DELAYLOADSTATE_NOTLOADED;
        this._prefiltered = false;
        if (onLoad) {
            this._delayedOnLoad = onLoad;
        }
        this.delayLoad(forcedExtension);
    };
    /**
     * Delays loading of the cube texture
     * @param forcedExtension defines the extension to use
     */
    CubeTexture.prototype.delayLoad = function (forcedExtension) {
        if (this.delayLoadState !== Constants.DELAYLOADSTATE_NOTLOADED) {
            return;
        }
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        this.delayLoadState = Constants.DELAYLOADSTATE_LOADED;
        this._texture = this._getFromCache(this.url, this._noMipmap);
        if (!this._texture) {
            if (this._prefiltered) {
                this._texture = scene.getEngine().createPrefilteredCubeTexture(this.url, scene, this.lodGenerationScale, this.lodGenerationOffset, this._delayedOnLoad, undefined, this._format, undefined, this._createPolynomials);
            }
            else {
                this._texture = scene.getEngine().createCubeTexture(this.url, scene, this._files, this._noMipmap, this._delayedOnLoad, null, this._format, forcedExtension);
            }
        }
    };
    /**
     * Returns the reflection texture matrix
     * @returns the reflection texture matrix
     */
    CubeTexture.prototype.getReflectionTextureMatrix = function () {
        return this._textureMatrix;
    };
    /**
     * Sets the reflection texture matrix
     * @param value Reflection texture matrix
     */
    CubeTexture.prototype.setReflectionTextureMatrix = function (value) {
        var _this = this;
        if (value.updateFlag === this._textureMatrix.updateFlag) {
            return;
        }
        if (value.isIdentity() !== this._textureMatrix.isIdentity()) {
            this.getScene().markAllMaterialsAsDirty(Constants.MATERIAL_TextureDirtyFlag, function (mat) { return mat.getActiveTextures().indexOf(_this) !== -1; });
        }
        this._textureMatrix = value;
    };
    /**
     * Parses text to create a cube texture
     * @param parsedTexture define the serialized text to read from
     * @param scene defines the hosting scene
     * @param rootUrl defines the root url of the cube texture
     * @returns a cube texture
     */
    CubeTexture.Parse = function (parsedTexture, scene, rootUrl) {
        var texture = SerializationHelper.Parse(function () {
            var prefiltered = false;
            if (parsedTexture.prefiltered) {
                prefiltered = parsedTexture.prefiltered;
            }
            return new CubeTexture(rootUrl + parsedTexture.name, scene, parsedTexture.extensions, false, null, null, null, undefined, prefiltered);
        }, parsedTexture, scene);
        // Local Cubemaps
        if (parsedTexture.boundingBoxPosition) {
            texture.boundingBoxPosition = Vector3.FromArray(parsedTexture.boundingBoxPosition);
        }
        if (parsedTexture.boundingBoxSize) {
            texture.boundingBoxSize = Vector3.FromArray(parsedTexture.boundingBoxSize);
        }
        // Animations
        if (parsedTexture.animations) {
            for (var animationIndex = 0; animationIndex < parsedTexture.animations.length; animationIndex++) {
                var parsedAnimation = parsedTexture.animations[animationIndex];
                var internalClass = _TypeStore.GetClass("BABYLON.Animation");
                if (internalClass) {
                    texture.animations.push(internalClass.Parse(parsedAnimation));
                }
            }
        }
        return texture;
    };
    /**
     * Makes a clone, or deep copy, of the cube texture
     * @returns a new cube texture
     */
    CubeTexture.prototype.clone = function () {
        var _this = this;
        var scene = this.getScene();
        var uniqueId = 0;
        var newCubeTexture = SerializationHelper.Clone(function () {
            if (!scene) {
                return _this;
            }
            var cubeTexture = new CubeTexture(_this.url, scene, _this._extensions, _this._noMipmap, _this._files);
            uniqueId = cubeTexture.uniqueId;
            return cubeTexture;
        }, this);
        newCubeTexture.uniqueId = uniqueId;
        return newCubeTexture;
    };
    __decorate([
        serialize("rotationY")
    ], CubeTexture.prototype, "rotationY", null);
    __decorate([
        serializeAsMatrix("textureMatrix")
    ], CubeTexture.prototype, "_textureMatrix", void 0);
    return CubeTexture;
}(BaseTexture));
Texture._CubeTextureParser = CubeTexture.Parse;
// Some exporters relies on Tools.Instantiate
_TypeStore.RegisteredTypes["BABYLON.CubeTexture"] = CubeTexture;

var name$1 = 'rgbdDecodePixelShader';
var shader$1 = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\n#include<helperFunctions>\nvoid main(void)\n{\ngl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);\n}";
Effect.ShadersStore[name$1] = shader$1;

/**
 * Class used to host texture specific utilities
 */
var BRDFTextureTools = /** @class */ (function () {
    function BRDFTextureTools() {
    }
    /**
     * Expand the BRDF Texture from RGBD to Half Float if necessary.
     * @param texture the texture to expand.
     */
    BRDFTextureTools._ExpandDefaultBRDFTexture = function (texture) {
        // Gets everything ready.
        var engine = texture.getEngine();
        var caps = engine.getCaps();
        var expandTexture = false;
        // If half float available we can uncompress the texture
        if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
            expandTexture = true;
            texture.type = Constants.TEXTURETYPE_HALF_FLOAT;
        }
        // If full float available we can uncompress the texture
        else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
            expandTexture = true;
            texture.type = Constants.TEXTURETYPE_FLOAT;
        }
        // Expand the texture if possible
        if (expandTexture) {
            // Do not use during decode.
            texture.isReady = false;
            // Simply run through the decode PP.
            var rgbdPostProcess_1 = new PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, engine, false, undefined, texture.type, undefined, null, false);
            texture._isRGBD = false;
            texture.invertY = false;
            // Hold the output of the decoding.
            var expandedTexture_1 = engine.createRenderTargetTexture(texture.width, {
                generateDepthBuffer: false,
                generateMipMaps: false,
                generateStencilBuffer: false,
                samplingMode: Constants.TEXTURE_BILINEAR_SAMPLINGMODE,
                type: texture.type,
                format: Constants.TEXTUREFORMAT_RGBA
            });
            rgbdPostProcess_1.getEffect().executeWhenCompiled(function () {
                // PP Render Pass
                rgbdPostProcess_1.onApply = function (effect) {
                    effect._bindTexture("textureSampler", texture);
                    effect.setFloat2("scale", 1, 1);
                };
                engine.scenes[0].postProcessManager.directRender([rgbdPostProcess_1], expandedTexture_1, true);
                // Cleanup
                engine.restoreDefaultFramebuffer();
                engine._releaseTexture(texture);
                engine._releaseFramebufferObjects(expandedTexture_1);
                if (rgbdPostProcess_1) {
                    rgbdPostProcess_1.dispose();
                }
                // Internal Swap
                expandedTexture_1._swapAndDie(texture);
                // Ready to get rolling again.
                texture.isReady = true;
            });
        }
    };
    /**
     * Gets a default environment BRDF for MS-BRDF Height Correlated BRDF
     * @param scene defines the hosting scene
     * @returns the environment BRDF texture
     */
    BRDFTextureTools.GetEnvironmentBRDFTexture = function (scene) {
        var _this = this;
        if (!scene.environmentBRDFTexture) {
            // Forces Delayed Texture Loading to prevent undefined error whilst setting RGBD values.
            var useDelayedTextureLoading = scene.useDelayedTextureLoading;
            scene.useDelayedTextureLoading = false;
            var texture = Texture.CreateFromBase64String(this._environmentBRDFBase64Texture, "EnvironmentBRDFTexture", scene, true, true, Texture.BILINEAR_SAMPLINGMODE);
            texture._texture._isRGBD = true;
            texture.wrapU = Texture.CLAMP_ADDRESSMODE;
            texture.wrapV = Texture.CLAMP_ADDRESSMODE;
            scene.environmentBRDFTexture = texture;
            scene.useDelayedTextureLoading = useDelayedTextureLoading;
            texture.onLoadObservable.addOnce(function () {
                _this._ExpandDefaultBRDFTexture(texture._texture);
            });
        }
        return scene.environmentBRDFTexture;
    };
    BRDFTextureTools._environmentBRDFBase64Texture = "data:image/png;base64,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";
    return BRDFTextureTools;
}());

/**
 * Define the code related to the clear coat parameters of the pbr material.
 */
var PBRClearCoatConfiguration = /** @class */ (function () {
    /**
     * Instantiate a new istance of clear coat configuration.
     * @param markAllSubMeshesAsTexturesDirty Callback to flag the material to dirty
     */
    function PBRClearCoatConfiguration(markAllSubMeshesAsTexturesDirty) {
        this._isEnabled = false;
        /**
         * Defines if the clear coat is enabled in the material.
         */
        this.isEnabled = false;
        /**
         * Defines the clear coat layer strength (between 0 and 1) it defaults to 1.
         */
        this.intensity = 1;
        /**
         * Defines the clear coat layer roughness.
         */
        this.roughness = 0;
        this._indiceOfRefraction = PBRClearCoatConfiguration._DefaultIndiceOfRefraction;
        /**
         * Defines the indice of refraction of the clear coat.
         * This defaults to 1.5 corresponding to a 0.04 f0 or a 4% reflectance at normal incidence
         * The default fits with a polyurethane material.
         * Changing the default value is more performance intensive.
         */
        this.indiceOfRefraction = PBRClearCoatConfiguration._DefaultIndiceOfRefraction;
        this._texture = null;
        /**
         * Stores the clear coat values in a texture.
         */
        this.texture = null;
        this._bumpTexture = null;
        /**
         * Define the clear coat specific bump texture.
         */
        this.bumpTexture = null;
        this._isTintEnabled = false;
        /**
         * Defines if the clear coat tint is enabled in the material.
         */
        this.isTintEnabled = false;
        /**
         * Defines the clear coat tint of the material.
         * This is only use if tint is enabled
         */
        this.tintColor = Color3.White();
        /**
         * Defines the distance at which the tint color should be found in the
         * clear coat media.
         * This is only use if tint is enabled
         */
        this.tintColorAtDistance = 1;
        /**
         * Defines the clear coat layer thickness.
         * This is only use if tint is enabled
         */
        this.tintThickness = 1;
        this._tintTexture = null;
        /**
         * Stores the clear tint values in a texture.
         * rgb is tint
         * a is a thickness factor
         */
        this.tintTexture = null;
        this._internalMarkAllSubMeshesAsTexturesDirty = markAllSubMeshesAsTexturesDirty;
    }
    /** @hidden */
    PBRClearCoatConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    /**
     * Gets wehter the submesh is ready to be used or not.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     * @param engine defines the engine the material belongs to.
     * @param disableBumpMap defines wether the material disables bump or not.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRClearCoatConfiguration.prototype.isReadyForSubMesh = function (defines, scene, engine, disableBumpMap) {
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (engine.getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.ClearCoatBumpTextureEnabled && !disableBumpMap) {
                    // Bump texture cannot be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                }
                if (this._isTintEnabled && this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                    if (!this._tintTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene to the material belongs to.
     */
    PBRClearCoatConfiguration.prototype.prepareDefines = function (defines, scene) {
        if (this._isEnabled) {
            defines.CLEARCOAT = true;
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "CLEARCOAT_TEXTURE");
                    }
                    else {
                        defines.CLEARCOAT_TEXTURE = false;
                    }
                    if (this._bumpTexture && MaterialFlags.ClearCoatBumpTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "CLEARCOAT_BUMP");
                    }
                    else {
                        defines.CLEARCOAT_BUMP = false;
                    }
                    defines.CLEARCOAT_DEFAULTIOR = this._indiceOfRefraction === PBRClearCoatConfiguration._DefaultIndiceOfRefraction;
                    if (this._isTintEnabled) {
                        defines.CLEARCOAT_TINT = true;
                        if (this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                            MaterialHelper.PrepareDefinesForMergedUV(this._tintTexture, defines, "CLEARCOAT_TINT_TEXTURE");
                        }
                        else {
                            defines.CLEARCOAT_TINT_TEXTURE = false;
                        }
                    }
                    else {
                        defines.CLEARCOAT_TINT = false;
                        defines.CLEARCOAT_TINT_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.CLEARCOAT = false;
            defines.CLEARCOAT_TEXTURE = false;
            defines.CLEARCOAT_BUMP = false;
            defines.CLEARCOAT_TINT = false;
            defines.CLEARCOAT_TINT_TEXTURE = false;
        }
    };
    /**
     * Binds the material data.
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param engine defines the engine the material belongs to.
     * @param disableBumpMap defines wether the material disables bump or not.
     * @param isFrozen defines wether the material is frozen or not.
     * @param invertNormalMapX If sets to true, x component of normal map value will be inverted (x = 1.0 - x).
     * @param invertNormalMapY If sets to true, y component of normal map value will be inverted (y = 1.0 - y).
     */
    PBRClearCoatConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, disableBumpMap, isFrozen, invertNormalMapX, invertNormalMapY) {
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.updateFloat2("vClearCoatInfos", this._texture.coordinatesIndex, this._texture.level);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "clearCoat");
            }
            if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.ClearCoatTextureEnabled && !disableBumpMap) {
                uniformBuffer.updateFloat2("vClearCoatBumpInfos", this._bumpTexture.coordinatesIndex, this._bumpTexture.level);
                MaterialHelper.BindTextureMatrix(this._bumpTexture, uniformBuffer, "clearCoatBump");
                if (scene._mirroredCameraPosition) {
                    uniformBuffer.updateFloat2("vClearCoatTangentSpaceParams", invertNormalMapX ? 1.0 : -1.0, invertNormalMapY ? 1.0 : -1.0);
                }
                else {
                    uniformBuffer.updateFloat2("vClearCoatTangentSpaceParams", invertNormalMapX ? -1.0 : 1.0, invertNormalMapY ? -1.0 : 1.0);
                }
            }
            if (this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                uniformBuffer.updateFloat2("vClearCoatTintInfos", this._tintTexture.coordinatesIndex, this._tintTexture.level);
                MaterialHelper.BindTextureMatrix(this._tintTexture, uniformBuffer, "clearCoatTint");
            }
            // Clear Coat General params
            uniformBuffer.updateFloat2("vClearCoatParams", this.intensity, this.roughness);
            // Clear Coat Refraction params
            var a = 1 - this._indiceOfRefraction;
            var b = 1 + this._indiceOfRefraction;
            var f0 = Math.pow((-a / b), 2); // Schlicks approx: (ior1 - ior2) / (ior1 + ior2) where ior2 for air is close to vacuum = 1.
            var eta = 1 / this._indiceOfRefraction;
            uniformBuffer.updateFloat4("vClearCoatRefractionParams", f0, eta, a, b);
            if (this._isTintEnabled) {
                uniformBuffer.updateFloat4("vClearCoatTintParams", this.tintColor.r, this.tintColor.g, this.tintColor.b, Math.max(0.00001, this.tintThickness));
                uniformBuffer.updateFloat("clearCoatColorAtDistance", Math.max(0.00001, this.tintColorAtDistance));
            }
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.ClearCoatTextureEnabled) {
                uniformBuffer.setTexture("clearCoatSampler", this._texture);
            }
            if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.ClearCoatBumpTextureEnabled && !disableBumpMap) {
                uniformBuffer.setTexture("clearCoatBumpSampler", this._bumpTexture);
            }
            if (this._isTintEnabled && this._tintTexture && MaterialFlags.ClearCoatTintTextureEnabled) {
                uniformBuffer.setTexture("clearCoatTintSampler", this._tintTexture);
            }
        }
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRClearCoatConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        if (this._tintTexture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Returns an array of the actively used textures.
     * @param activeTextures Array of BaseTextures
     */
    PBRClearCoatConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        if (this._tintTexture) {
            activeTextures.push(this._tintTexture);
        }
    };
    /**
     * Returns the animatable textures.
     * @param animatables Array of animatable textures.
     */
    PBRClearCoatConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
        if (this._bumpTexture && this._bumpTexture.animations && this._bumpTexture.animations.length > 0) {
            animatables.push(this._bumpTexture);
        }
        if (this._tintTexture && this._tintTexture.animations && this._tintTexture.animations.length > 0) {
            animatables.push(this._tintTexture);
        }
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRClearCoatConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._texture) {
                this._texture.dispose();
            }
            if (this._bumpTexture) {
                this._bumpTexture.dispose();
            }
            if (this._tintTexture) {
                this._tintTexture.dispose();
            }
        }
    };
    /**
    * Get the current class name of the texture useful for serialization or dynamic coding.
    * @returns "PBRClearCoatConfiguration"
    */
    PBRClearCoatConfiguration.prototype.getClassName = function () {
        return "PBRClearCoatConfiguration";
    };
    /**
     * Add fallbacks to the effect fallbacks list.
     * @param defines defines the Base texture to use.
     * @param fallbacks defines the current fallback list.
     * @param currentRank defines the current fallback rank.
     * @returns the new fallback rank.
     */
    PBRClearCoatConfiguration.AddFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.CLEARCOAT_BUMP) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT_BUMP");
        }
        if (defines.CLEARCOAT_TINT) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT_TINT");
        }
        if (defines.CLEARCOAT) {
            fallbacks.addFallback(currentRank++, "CLEARCOAT");
        }
        return currentRank;
    };
    /**
     * Add the required uniforms to the current list.
     * @param uniforms defines the current uniform list.
     */
    PBRClearCoatConfiguration.AddUniforms = function (uniforms) {
        uniforms.push("vClearCoatTangentSpaceParams", "vClearCoatParams", "vClearCoatRefractionParams", "vClearCoatTintParams", "clearCoatColorAtDistance", "clearCoatMatrix", "clearCoatBumpMatrix", "clearCoatTintMatrix", "vClearCoatInfos", "vClearCoatBumpInfos", "vClearCoatTintInfos");
    };
    /**
     * Add the required samplers to the current list.
     * @param samplers defines the current sampler list.
     */
    PBRClearCoatConfiguration.AddSamplers = function (samplers) {
        samplers.push("clearCoatSampler", "clearCoatBumpSampler", "clearCoatTintSampler");
    };
    /**
     * Add the required uniforms to the current buffer.
     * @param uniformBuffer defines the current uniform buffer.
     */
    PBRClearCoatConfiguration.PrepareUniformBuffer = function (uniformBuffer) {
        uniformBuffer.addUniform("vClearCoatParams", 2);
        uniformBuffer.addUniform("vClearCoatRefractionParams", 4);
        uniformBuffer.addUniform("vClearCoatInfos", 2);
        uniformBuffer.addUniform("clearCoatMatrix", 16);
        uniformBuffer.addUniform("vClearCoatBumpInfos", 2);
        uniformBuffer.addUniform("vClearCoatTangentSpaceParams", 2);
        uniformBuffer.addUniform("clearCoatBumpMatrix", 16);
        uniformBuffer.addUniform("vClearCoatTintParams", 4);
        uniformBuffer.addUniform("clearCoatColorAtDistance", 1);
        uniformBuffer.addUniform("vClearCoatTintInfos", 2);
        uniformBuffer.addUniform("clearCoatTintMatrix", 16);
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param clearCoatConfiguration define the config where to copy the info
     */
    PBRClearCoatConfiguration.prototype.copyTo = function (clearCoatConfiguration) {
        SerializationHelper.Clone(function () { return clearCoatConfiguration; }, this);
    };
    /**
     * Serializes this clear coat configuration.
     * @returns - An object with the serialized config.
     */
    PBRClearCoatConfiguration.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a Clear Coat Configuration from a serialized object.
     * @param source - Serialized object.
     */
    PBRClearCoatConfiguration.prototype.parse = function (source) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, null);
    };
    /**
     * This defaults to 1.5 corresponding to a 0.04 f0 or a 4% reflectance at normal incidence
     * The default fits with a polyurethane material.
     */
    PBRClearCoatConfiguration._DefaultIndiceOfRefraction = 1.5;
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "_isEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "intensity", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "roughness", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "_indiceOfRefraction", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "indiceOfRefraction", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRClearCoatConfiguration.prototype, "_texture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "texture", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRClearCoatConfiguration.prototype, "_bumpTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "bumpTexture", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "_isTintEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "isTintEnabled", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRClearCoatConfiguration.prototype, "tintColor", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "tintColorAtDistance", void 0);
    __decorate([
        serialize()
    ], PBRClearCoatConfiguration.prototype, "tintThickness", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRClearCoatConfiguration.prototype, "_tintTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRClearCoatConfiguration.prototype, "tintTexture", void 0);
    return PBRClearCoatConfiguration;
}());

/**
 * Define the code related to the anisotropic parameters of the pbr material.
 */
var PBRAnisotropicConfiguration = /** @class */ (function () {
    /**
     * Instantiate a new istance of anisotropy configuration.
     * @param markAllSubMeshesAsTexturesDirty Callback to flag the material to dirty
     */
    function PBRAnisotropicConfiguration(markAllSubMeshesAsTexturesDirty) {
        this._isEnabled = false;
        /**
         * Defines if the anisotropy is enabled in the material.
         */
        this.isEnabled = false;
        /**
         * Defines the anisotropy strength (between 0 and 1) it defaults to 1.
         */
        this.intensity = 1;
        /**
         * Defines if the effect is along the tangents, bitangents or in between.
         * By default, the effect is "strectching" the highlights along the tangents.
         */
        this.direction = new Vector2(1, 0);
        this._texture = null;
        /**
         * Stores the anisotropy values in a texture.
         * rg is direction (like normal from -1 to 1)
         * b is a intensity
         */
        this.texture = null;
        this._internalMarkAllSubMeshesAsTexturesDirty = markAllSubMeshesAsTexturesDirty;
    }
    /** @hidden */
    PBRAnisotropicConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    /**
     * Specifies that the submesh is ready to be used.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRAnisotropicConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param defines the list of "defines" to update.
     * @param mesh the mesh we are preparing the defines for.
     * @param scene defines the scene the material belongs to.
     */
    PBRAnisotropicConfiguration.prototype.prepareDefines = function (defines, mesh, scene) {
        if (this._isEnabled) {
            defines.ANISOTROPIC = this._isEnabled;
            if (this._isEnabled && !mesh.isVerticesDataPresent(VertexBuffer.TangentKind)) {
                defines._needUVs = true;
                defines.MAINUV1 = true;
            }
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "ANISOTROPIC_TEXTURE");
                    }
                    else {
                        defines.ANISOTROPIC_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.ANISOTROPIC = false;
            defines.ANISOTROPIC_TEXTURE = false;
        }
    };
    /**
     * Binds the material data.
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param isFrozen defines wether the material is frozen or not.
     */
    PBRAnisotropicConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, isFrozen) {
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                uniformBuffer.updateFloat2("vAnisotropyInfos", this._texture.coordinatesIndex, this._texture.level);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "anisotropy");
            }
            // Anisotropy
            uniformBuffer.updateFloat3("vAnisotropy", this.direction.x, this.direction.y, this.intensity);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.AnisotropicTextureEnabled) {
                uniformBuffer.setTexture("anisotropySampler", this._texture);
            }
        }
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRAnisotropicConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Returns an array of the actively used textures.
     * @param activeTextures Array of BaseTextures
     */
    PBRAnisotropicConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
    };
    /**
     * Returns the animatable textures.
     * @param animatables Array of animatable textures.
     */
    PBRAnisotropicConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRAnisotropicConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._texture) {
                this._texture.dispose();
            }
        }
    };
    /**
    * Get the current class name of the texture useful for serialization or dynamic coding.
    * @returns "PBRAnisotropicConfiguration"
    */
    PBRAnisotropicConfiguration.prototype.getClassName = function () {
        return "PBRAnisotropicConfiguration";
    };
    /**
     * Add fallbacks to the effect fallbacks list.
     * @param defines defines the Base texture to use.
     * @param fallbacks defines the current fallback list.
     * @param currentRank defines the current fallback rank.
     * @returns the new fallback rank.
     */
    PBRAnisotropicConfiguration.AddFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.ANISOTROPIC) {
            fallbacks.addFallback(currentRank++, "ANISOTROPIC");
        }
        return currentRank;
    };
    /**
     * Add the required uniforms to the current list.
     * @param uniforms defines the current uniform list.
     */
    PBRAnisotropicConfiguration.AddUniforms = function (uniforms) {
        uniforms.push("vAnisotropy", "vAnisotropyInfos", "anisotropyMatrix");
    };
    /**
     * Add the required uniforms to the current buffer.
     * @param uniformBuffer defines the current uniform buffer.
     */
    PBRAnisotropicConfiguration.PrepareUniformBuffer = function (uniformBuffer) {
        uniformBuffer.addUniform("vAnisotropy", 3);
        uniformBuffer.addUniform("vAnisotropyInfos", 2);
        uniformBuffer.addUniform("anisotropyMatrix", 16);
    };
    /**
     * Add the required samplers to the current list.
     * @param samplers defines the current sampler list.
     */
    PBRAnisotropicConfiguration.AddSamplers = function (samplers) {
        samplers.push("anisotropySampler");
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param anisotropicConfiguration define the config where to copy the info
     */
    PBRAnisotropicConfiguration.prototype.copyTo = function (anisotropicConfiguration) {
        SerializationHelper.Clone(function () { return anisotropicConfiguration; }, this);
    };
    /**
     * Serializes this anisotropy configuration.
     * @returns - An object with the serialized config.
     */
    PBRAnisotropicConfiguration.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a anisotropy Configuration from a serialized object.
     * @param source - Serialized object.
     */
    PBRAnisotropicConfiguration.prototype.parse = function (source) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, null);
    };
    __decorate([
        serialize()
    ], PBRAnisotropicConfiguration.prototype, "_isEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRAnisotropicConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRAnisotropicConfiguration.prototype, "intensity", void 0);
    __decorate([
        serializeAsVector2()
    ], PBRAnisotropicConfiguration.prototype, "direction", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRAnisotropicConfiguration.prototype, "_texture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRAnisotropicConfiguration.prototype, "texture", void 0);
    return PBRAnisotropicConfiguration;
}());

/**
 * Define the code related to the BRDF parameters of the pbr material.
 */
var PBRBRDFConfiguration = /** @class */ (function () {
    /**
     * Instantiate a new istance of clear coat configuration.
     * @param markAllSubMeshesAsMiscDirty Callback to flag the material to dirty
     */
    function PBRBRDFConfiguration(markAllSubMeshesAsMiscDirty) {
        this._useEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION;
        /**
         * Defines if the material uses energy conservation.
         */
        this.useEnergyConservation = PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION;
        this._useSmithVisibilityHeightCorrelated = PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED;
        /**
         * LEGACY Mode set to false
         * Defines if the material uses height smith correlated visibility term.
         * If you intent to not use our default BRDF, you need to load a separate BRDF Texture for the PBR
         * You can either load https://assets.babylonjs.com/environments/uncorrelatedBRDF.png
         * or https://assets.babylonjs.com/environments/uncorrelatedBRDF.dds to have more precision
         * Not relying on height correlated will also disable energy conservation.
         */
        this.useSmithVisibilityHeightCorrelated = PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED;
        this._useSphericalHarmonics = PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS;
        /**
         * LEGACY Mode set to false
         * Defines if the material uses spherical harmonics vs spherical polynomials for the
         * diffuse part of the IBL.
         * The harmonics despite a tiny bigger cost has been proven to provide closer results
         * to the ground truth.
         */
        this.useSphericalHarmonics = PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS;
        this._internalMarkAllSubMeshesAsMiscDirty = markAllSubMeshesAsMiscDirty;
    }
    /** @hidden */
    PBRBRDFConfiguration.prototype._markAllSubMeshesAsMiscDirty = function () {
        this._internalMarkAllSubMeshesAsMiscDirty();
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param defines the list of "defines" to update.
     */
    PBRBRDFConfiguration.prototype.prepareDefines = function (defines) {
        defines.BRDF_V_HEIGHT_CORRELATED = this._useSmithVisibilityHeightCorrelated;
        defines.MS_BRDF_ENERGY_CONSERVATION = this._useEnergyConservation && this._useSmithVisibilityHeightCorrelated;
        defines.SPHERICAL_HARMONICS = this._useSphericalHarmonics;
    };
    /**
    * Get the current class name of the texture useful for serialization or dynamic coding.
    * @returns "PBRClearCoatConfiguration"
    */
    PBRBRDFConfiguration.prototype.getClassName = function () {
        return "PBRBRDFConfiguration";
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param brdfConfiguration define the config where to copy the info
     */
    PBRBRDFConfiguration.prototype.copyTo = function (brdfConfiguration) {
        SerializationHelper.Clone(function () { return brdfConfiguration; }, this);
    };
    /**
     * Serializes this BRDF configuration.
     * @returns - An object with the serialized config.
     */
    PBRBRDFConfiguration.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a BRDF Configuration from a serialized object.
     * @param source - Serialized object.
     */
    PBRBRDFConfiguration.prototype.parse = function (source) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, null);
    };
    /**
     * Default value used for the energy conservation.
     * This should only be changed to adapt to the type of texture in scene.environmentBRDFTexture.
     */
    PBRBRDFConfiguration.DEFAULT_USE_ENERGY_CONSERVATION = true;
    /**
     * Default value used for the Smith Visibility Height Correlated mode.
     * This should only be changed to adapt to the type of texture in scene.environmentBRDFTexture.
     */
    PBRBRDFConfiguration.DEFAULT_USE_SMITH_VISIBILITY_HEIGHT_CORRELATED = true;
    /**
     * Default value used for the IBL diffuse part.
     * This can help switching back to the polynomials mode globally which is a tiny bit
     * less GPU intensive at the drawback of a lower quality.
     */
    PBRBRDFConfiguration.DEFAULT_USE_SPHERICAL_HARMONICS = true;
    __decorate([
        serialize()
    ], PBRBRDFConfiguration.prototype, "_useEnergyConservation", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useEnergyConservation", void 0);
    __decorate([
        serialize()
    ], PBRBRDFConfiguration.prototype, "_useSmithVisibilityHeightCorrelated", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useSmithVisibilityHeightCorrelated", void 0);
    __decorate([
        serialize()
    ], PBRBRDFConfiguration.prototype, "_useSphericalHarmonics", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBRDFConfiguration.prototype, "useSphericalHarmonics", void 0);
    return PBRBRDFConfiguration;
}());

/**
 * Define the code related to the Sheen parameters of the pbr material.
 */
var PBRSheenConfiguration = /** @class */ (function () {
    /**
     * Instantiate a new istance of clear coat configuration.
     * @param markAllSubMeshesAsTexturesDirty Callback to flag the material to dirty
     */
    function PBRSheenConfiguration(markAllSubMeshesAsTexturesDirty) {
        this._isEnabled = false;
        /**
         * Defines if the material uses sheen.
         */
        this.isEnabled = false;
        this._linkSheenWithAlbedo = false;
        /**
         * Defines if the sheen is linked to the sheen color.
         */
        this.linkSheenWithAlbedo = false;
        /**
         * Defines the sheen intensity.
         */
        this.intensity = 1;
        /**
         * Defines the sheen color.
         */
        this.color = Color3.White();
        this._texture = null;
        /**
         * Stores the sheen tint values in a texture.
         * rgb is tint
         * a is a intensity
         */
        this.texture = null;
        this._internalMarkAllSubMeshesAsTexturesDirty = markAllSubMeshesAsTexturesDirty;
    }
    /** @hidden */
    PBRSheenConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    /**
     * Specifies that the submesh is ready to be used.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRSheenConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._texture && MaterialFlags.SheenTextureEnabled) {
                    if (!this._texture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     */
    PBRSheenConfiguration.prototype.prepareDefines = function (defines, scene) {
        if (this._isEnabled) {
            defines.SHEEN = this._isEnabled;
            defines.SHEEN_LINKWITHALBEDO = this._linkSheenWithAlbedo;
            if (defines._areTexturesDirty) {
                if (scene.texturesEnabled) {
                    if (this._texture && MaterialFlags.SheenTextureEnabled) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._texture, defines, "SHEEN_TEXTURE");
                    }
                    else {
                        defines.SHEEN_TEXTURE = false;
                    }
                }
            }
        }
        else {
            defines.SHEEN = false;
            defines.SHEEN_TEXTURE = false;
            defines.SHEEN_LINKWITHALBEDO = false;
        }
    };
    /**
     * Binds the material data.
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param isFrozen defines wether the material is frozen or not.
     */
    PBRSheenConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, isFrozen) {
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._texture && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.updateFloat2("vSheenInfos", this._texture.coordinatesIndex, this._texture.level);
                MaterialHelper.BindTextureMatrix(this._texture, uniformBuffer, "sheen");
            }
            // Sheen
            uniformBuffer.updateFloat4("vSheenColor", this.color.r, this.color.g, this.color.b, this.intensity);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._texture && MaterialFlags.SheenTextureEnabled) {
                uniformBuffer.setTexture("sheenSampler", this._texture);
            }
        }
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRSheenConfiguration.prototype.hasTexture = function (texture) {
        if (this._texture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Returns an array of the actively used textures.
     * @param activeTextures Array of BaseTextures
     */
    PBRSheenConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._texture) {
            activeTextures.push(this._texture);
        }
    };
    /**
     * Returns the animatable textures.
     * @param animatables Array of animatable textures.
     */
    PBRSheenConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._texture && this._texture.animations && this._texture.animations.length > 0) {
            animatables.push(this._texture);
        }
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRSheenConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._texture) {
                this._texture.dispose();
            }
        }
    };
    /**
    * Get the current class name of the texture useful for serialization or dynamic coding.
    * @returns "PBRSheenConfiguration"
    */
    PBRSheenConfiguration.prototype.getClassName = function () {
        return "PBRSheenConfiguration";
    };
    /**
     * Add fallbacks to the effect fallbacks list.
     * @param defines defines the Base texture to use.
     * @param fallbacks defines the current fallback list.
     * @param currentRank defines the current fallback rank.
     * @returns the new fallback rank.
     */
    PBRSheenConfiguration.AddFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.SHEEN) {
            fallbacks.addFallback(currentRank++, "SHEEN");
        }
        return currentRank;
    };
    /**
     * Add the required uniforms to the current list.
     * @param uniforms defines the current uniform list.
     */
    PBRSheenConfiguration.AddUniforms = function (uniforms) {
        uniforms.push("vSheenColor", "vSheenInfos", "sheenMatrix");
    };
    /**
     * Add the required uniforms to the current buffer.
     * @param uniformBuffer defines the current uniform buffer.
     */
    PBRSheenConfiguration.PrepareUniformBuffer = function (uniformBuffer) {
        uniformBuffer.addUniform("vSheenColor", 4);
        uniformBuffer.addUniform("vSheenInfos", 2);
        uniformBuffer.addUniform("sheenMatrix", 16);
    };
    /**
     * Add the required samplers to the current list.
     * @param samplers defines the current sampler list.
     */
    PBRSheenConfiguration.AddSamplers = function (samplers) {
        samplers.push("sheenSampler");
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param sheenConfiguration define the config where to copy the info
     */
    PBRSheenConfiguration.prototype.copyTo = function (sheenConfiguration) {
        SerializationHelper.Clone(function () { return sheenConfiguration; }, this);
    };
    /**
     * Serializes this BRDF configuration.
     * @returns - An object with the serialized config.
     */
    PBRSheenConfiguration.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a Sheen Configuration from a serialized object.
     * @param source - Serialized object.
     */
    PBRSheenConfiguration.prototype.parse = function (source) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, null);
    };
    __decorate([
        serialize()
    ], PBRSheenConfiguration.prototype, "_isEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "isEnabled", void 0);
    __decorate([
        serialize()
    ], PBRSheenConfiguration.prototype, "_linkSheenWithAlbedo", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "linkSheenWithAlbedo", void 0);
    __decorate([
        serialize()
    ], PBRSheenConfiguration.prototype, "intensity", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSheenConfiguration.prototype, "color", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRSheenConfiguration.prototype, "_texture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSheenConfiguration.prototype, "texture", void 0);
    return PBRSheenConfiguration;
}());

/**
 * Define the code related to the sub surface parameters of the pbr material.
 */
var PBRSubSurfaceConfiguration = /** @class */ (function () {
    /**
     * Instantiate a new istance of sub surface configuration.
     * @param markAllSubMeshesAsTexturesDirty Callback to flag the material to dirty
     */
    function PBRSubSurfaceConfiguration(markAllSubMeshesAsTexturesDirty) {
        this._isRefractionEnabled = false;
        /**
         * Defines if the refraction is enabled in the material.
         */
        this.isRefractionEnabled = false;
        this._isTranslucencyEnabled = false;
        /**
         * Defines if the translucency is enabled in the material.
         */
        this.isTranslucencyEnabled = false;
        this._isScatteringEnabled = false;
        // /**
        //  * Defines if the sub surface scattering is enabled in the material.
        //  */
        // @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        // public isScatteringEnabled = false;
        /**
         * Defines the refraction intensity of the material.
         * The refraction when enabled replaces the Diffuse part of the material.
         * The intensity helps transitionning between diffuse and refraction.
         */
        this.refractionIntensity = 1;
        /**
         * Defines the translucency intensity of the material.
         * When translucency has been enabled, this defines how much of the "translucency"
         * is addded to the diffuse part of the material.
         */
        this.translucencyIntensity = 1;
        /**
         * Defines the scattering intensity of the material.
         * When scattering has been enabled, this defines how much of the "scattered light"
         * is addded to the diffuse part of the material.
         */
        this.scatteringIntensity = 1;
        this._thicknessTexture = null;
        /**
         * Stores the average thickness of a mesh in a texture (The texture is holding the values linearly).
         * The red channel of the texture should contain the thickness remapped between 0 and 1.
         * 0 would mean minimumThickness
         * 1 would mean maximumThickness
         * The other channels might be use as a mask to vary the different effects intensity.
         */
        this.thicknessTexture = null;
        this._refractionTexture = null;
        /**
         * Defines the texture to use for refraction.
         */
        this.refractionTexture = null;
        this._indexOfRefraction = 1;
        /**
         * Defines the indice of refraction used in the material.
         * https://en.wikipedia.org/wiki/List_of_refractive_indices
         */
        this.indexOfRefraction = 1;
        this._invertRefractionY = false;
        /**
         * Controls if refraction needs to be inverted on Y. This could be useful for procedural texture.
         */
        this.invertRefractionY = false;
        this._linkRefractionWithTransparency = false;
        /**
         * This parameters will make the material used its opacity to control how much it is refracting aginst not.
         * Materials half opaque for instance using refraction could benefit from this control.
         */
        this.linkRefractionWithTransparency = false;
        /**
         * Defines the minimum thickness stored in the thickness map.
         * If no thickness map is defined, this value will be used to simulate thickness.
         */
        this.minimumThickness = 0;
        /**
         * Defines the maximum thickness stored in the thickness map.
         */
        this.maximumThickness = 1;
        /**
         * Defines the volume tint of the material.
         * This is used for both translucency and scattering.
         */
        this.tintColor = Color3.White();
        /**
         * Defines the distance at which the tint color should be found in the media.
         * This is used for refraction only.
         */
        this.tintColorAtDistance = 1;
        /**
         * Defines how far each channel transmit through the media.
         * It is defined as a color to simplify it selection.
         */
        this.diffusionDistance = Color3.White();
        this._useMaskFromThicknessTexture = false;
        /**
         * Stores the intensity of the different subsurface effects in the thickness texture.
         * * the green channel is the translucency intensity.
         * * the blue channel is the scattering intensity.
         * * the alpha channel is the refraction intensity.
         */
        this.useMaskFromThicknessTexture = false;
        this._internalMarkAllSubMeshesAsTexturesDirty = markAllSubMeshesAsTexturesDirty;
    }
    /** @hidden */
    PBRSubSurfaceConfiguration.prototype._markAllSubMeshesAsTexturesDirty = function () {
        this._internalMarkAllSubMeshesAsTexturesDirty();
    };
    /**
     * Gets wehter the submesh is ready to be used or not.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene the material belongs to.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRSubSurfaceConfiguration.prototype.isReadyForSubMesh = function (defines, scene) {
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                    if (!this._thicknessTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                var refractionTexture = this._getRefractionTexture(scene);
                if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                    if (!refractionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param defines the list of "defines" to update.
     * @param scene defines the scene to the material belongs to.
     */
    PBRSubSurfaceConfiguration.prototype.prepareDefines = function (defines, scene) {
        if (defines._areTexturesDirty) {
            defines.SUBSURFACE = false;
            defines.SS_TRANSLUCENCY = this._isTranslucencyEnabled;
            defines.SS_SCATERRING = this._isScatteringEnabled;
            defines.SS_THICKNESSANDMASK_TEXTURE = false;
            defines.SS_MASK_FROM_THICKNESS_TEXTURE = false;
            defines.SS_REFRACTION = false;
            defines.SS_REFRACTIONMAP_3D = false;
            defines.SS_GAMMAREFRACTION = false;
            defines.SS_RGBDREFRACTION = false;
            defines.SS_REFRACTIONMAP_OPPOSITEZ = false;
            defines.SS_LODINREFRACTIONALPHA = false;
            defines.SS_LINKREFRACTIONTOTRANSPARENCY = false;
            if (this._isRefractionEnabled || this._isTranslucencyEnabled || this._isScatteringEnabled) {
                defines.SUBSURFACE = true;
                if (defines._areTexturesDirty) {
                    if (scene.texturesEnabled) {
                        if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                            MaterialHelper.PrepareDefinesForMergedUV(this._thicknessTexture, defines, "SS_THICKNESSANDMASK_TEXTURE");
                        }
                    }
                }
                defines.SS_MASK_FROM_THICKNESS_TEXTURE = this._useMaskFromThicknessTexture;
            }
            if (this._isRefractionEnabled) {
                if (scene.texturesEnabled) {
                    var refractionTexture = this._getRefractionTexture(scene);
                    if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                        defines.SS_REFRACTION = true;
                        defines.SS_REFRACTIONMAP_3D = refractionTexture.isCube;
                        defines.SS_GAMMAREFRACTION = refractionTexture.gammaSpace;
                        defines.SS_RGBDREFRACTION = refractionTexture.isRGBD;
                        defines.SS_REFRACTIONMAP_OPPOSITEZ = refractionTexture.invertZ;
                        defines.SS_LODINREFRACTIONALPHA = refractionTexture.lodLevelInAlpha;
                        defines.SS_LINKREFRACTIONTOTRANSPARENCY = this._linkRefractionWithTransparency;
                    }
                }
            }
        }
    };
    /**
     * Binds the material data.
     * @param uniformBuffer defines the Uniform buffer to fill in.
     * @param scene defines the scene the material belongs to.
     * @param engine defines the engine the material belongs to.
     * @param isFrozen defines wether the material is frozen or not.
     * @param lodBasedMicrosurface defines wether the material relies on lod based microsurface or not.
     */
    PBRSubSurfaceConfiguration.prototype.bindForSubMesh = function (uniformBuffer, scene, engine, isFrozen, lodBasedMicrosurface) {
        var refractionTexture = this._getRefractionTexture(scene);
        if (!uniformBuffer.useUbo || !isFrozen || !uniformBuffer.isSync) {
            if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                uniformBuffer.updateFloat2("vThicknessInfos", this._thicknessTexture.coordinatesIndex, this._thicknessTexture.level);
                MaterialHelper.BindTextureMatrix(this._thicknessTexture, uniformBuffer, "thickness");
            }
            uniformBuffer.updateFloat2("vThicknessParam", this.minimumThickness, this.maximumThickness - this.minimumThickness);
            if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                uniformBuffer.updateMatrix("refractionMatrix", refractionTexture.getReflectionTextureMatrix());
                var depth = 1.0;
                if (!refractionTexture.isCube) {
                    if (refractionTexture.depth) {
                        depth = refractionTexture.depth;
                    }
                }
                uniformBuffer.updateFloat4("vRefractionInfos", refractionTexture.level, 1 / this._indexOfRefraction, depth, this._invertRefractionY ? -1 : 1);
                uniformBuffer.updateFloat3("vRefractionMicrosurfaceInfos", refractionTexture.getSize().width, refractionTexture.lodGenerationScale, refractionTexture.lodGenerationOffset);
            }
            uniformBuffer.updateColor3("vDiffusionDistance", this.diffusionDistance);
            uniformBuffer.updateFloat4("vTintColor", this.tintColor.r, this.tintColor.g, this.tintColor.b, this.tintColorAtDistance);
            uniformBuffer.updateFloat3("vSubSurfaceIntensity", this.refractionIntensity, this.translucencyIntensity, this.scatteringIntensity);
        }
        // Textures
        if (scene.texturesEnabled) {
            if (this._thicknessTexture && MaterialFlags.ThicknessTextureEnabled) {
                uniformBuffer.setTexture("thicknessSampler", this._thicknessTexture);
            }
            if (refractionTexture && MaterialFlags.RefractionTextureEnabled) {
                if (lodBasedMicrosurface) {
                    uniformBuffer.setTexture("refractionSampler", refractionTexture);
                }
                else {
                    uniformBuffer.setTexture("refractionSampler", refractionTexture._lodTextureMid || refractionTexture);
                    uniformBuffer.setTexture("refractionSamplerLow", refractionTexture._lodTextureLow || refractionTexture);
                    uniformBuffer.setTexture("refractionSamplerHigh", refractionTexture._lodTextureHigh || refractionTexture);
                }
            }
        }
    };
    /**
     * Unbinds the material from the mesh.
     * @param activeEffect defines the effect that should be unbound from.
     * @returns true if unbound, otherwise false
     */
    PBRSubSurfaceConfiguration.prototype.unbind = function (activeEffect) {
        if (this._refractionTexture && this._refractionTexture.isRenderTarget) {
            activeEffect.setTexture("refractionSampler", null);
            return true;
        }
        return false;
    };
    /**
     * Returns the texture used for refraction or null if none is used.
     * @param scene defines the scene the material belongs to.
     * @returns - Refraction texture if present.  If no refraction texture and refraction
     * is linked with transparency, returns environment texture.  Otherwise, returns null.
     */
    PBRSubSurfaceConfiguration.prototype._getRefractionTexture = function (scene) {
        if (this._refractionTexture) {
            return this._refractionTexture;
        }
        if (this._isRefractionEnabled) {
            return scene.environmentTexture;
        }
        return null;
    };
    Object.defineProperty(PBRSubSurfaceConfiguration.prototype, "disableAlphaBlending", {
        /**
         * Returns true if alpha blending should be disabled.
         */
        get: function () {
            return this.isRefractionEnabled && this._linkRefractionWithTransparency;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Fills the list of render target textures.
     * @param renderTargets the list of render targets to update
     */
    PBRSubSurfaceConfiguration.prototype.fillRenderTargetTextures = function (renderTargets) {
        if (MaterialFlags.RefractionTextureEnabled && this._refractionTexture && this._refractionTexture.isRenderTarget) {
            renderTargets.push(this._refractionTexture);
        }
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRSubSurfaceConfiguration.prototype.hasTexture = function (texture) {
        if (this._thicknessTexture === texture) {
            return true;
        }
        if (this._refractionTexture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Gets a boolean indicating that current material needs to register RTT
     * @returns true if this uses a render target otherwise false.
     */
    PBRSubSurfaceConfiguration.prototype.hasRenderTargetTextures = function () {
        if (MaterialFlags.RefractionTextureEnabled && this._refractionTexture && this._refractionTexture.isRenderTarget) {
            return true;
        }
        return false;
    };
    /**
     * Returns an array of the actively used textures.
     * @param activeTextures Array of BaseTextures
     */
    PBRSubSurfaceConfiguration.prototype.getActiveTextures = function (activeTextures) {
        if (this._thicknessTexture) {
            activeTextures.push(this._thicknessTexture);
        }
        if (this._refractionTexture) {
            activeTextures.push(this._refractionTexture);
        }
    };
    /**
     * Returns the animatable textures.
     * @param animatables Array of animatable textures.
     */
    PBRSubSurfaceConfiguration.prototype.getAnimatables = function (animatables) {
        if (this._thicknessTexture && this._thicknessTexture.animations && this._thicknessTexture.animations.length > 0) {
            animatables.push(this._thicknessTexture);
        }
        if (this._refractionTexture && this._refractionTexture.animations && this._refractionTexture.animations.length > 0) {
            animatables.push(this._refractionTexture);
        }
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRSubSurfaceConfiguration.prototype.dispose = function (forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._thicknessTexture) {
                this._thicknessTexture.dispose();
            }
            if (this._refractionTexture) {
                this._refractionTexture.dispose();
            }
        }
    };
    /**
    * Get the current class name of the texture useful for serialization or dynamic coding.
    * @returns "PBRSubSurfaceConfiguration"
    */
    PBRSubSurfaceConfiguration.prototype.getClassName = function () {
        return "PBRSubSurfaceConfiguration";
    };
    /**
     * Add fallbacks to the effect fallbacks list.
     * @param defines defines the Base texture to use.
     * @param fallbacks defines the current fallback list.
     * @param currentRank defines the current fallback rank.
     * @returns the new fallback rank.
     */
    PBRSubSurfaceConfiguration.AddFallbacks = function (defines, fallbacks, currentRank) {
        if (defines.SS_SCATERRING) {
            fallbacks.addFallback(currentRank++, "SS_SCATERRING");
        }
        if (defines.SS_TRANSLUCENCY) {
            fallbacks.addFallback(currentRank++, "SS_TRANSLUCENCY");
        }
        return currentRank;
    };
    /**
     * Add the required uniforms to the current list.
     * @param uniforms defines the current uniform list.
     */
    PBRSubSurfaceConfiguration.AddUniforms = function (uniforms) {
        uniforms.push("vDiffusionDistance", "vTintColor", "vSubSurfaceIntensity", "vRefractionMicrosurfaceInfos", "vRefractionInfos", "vThicknessInfos", "vThicknessParam", "refractionMatrix", "thicknessMatrix");
    };
    /**
     * Add the required samplers to the current list.
     * @param samplers defines the current sampler list.
     */
    PBRSubSurfaceConfiguration.AddSamplers = function (samplers) {
        samplers.push("thicknessSampler", "refractionSampler", "refractionSamplerLow", "refractionSamplerHigh");
    };
    /**
     * Add the required uniforms to the current buffer.
     * @param uniformBuffer defines the current uniform buffer.
     */
    PBRSubSurfaceConfiguration.PrepareUniformBuffer = function (uniformBuffer) {
        uniformBuffer.addUniform("vRefractionMicrosurfaceInfos", 3);
        uniformBuffer.addUniform("vRefractionInfos", 4);
        uniformBuffer.addUniform("refractionMatrix", 16);
        uniformBuffer.addUniform("vThicknessInfos", 2);
        uniformBuffer.addUniform("thicknessMatrix", 16);
        uniformBuffer.addUniform("vThicknessParam", 2);
        uniformBuffer.addUniform("vDiffusionDistance", 3);
        uniformBuffer.addUniform("vTintColor", 4);
        uniformBuffer.addUniform("vSubSurfaceIntensity", 3);
    };
    /**
     * Makes a duplicate of the current configuration into another one.
     * @param configuration define the config where to copy the info
     */
    PBRSubSurfaceConfiguration.prototype.copyTo = function (configuration) {
        SerializationHelper.Clone(function () { return configuration; }, this);
    };
    /**
     * Serializes this Sub Surface configuration.
     * @returns - An object with the serialized config.
     */
    PBRSubSurfaceConfiguration.prototype.serialize = function () {
        return SerializationHelper.Serialize(this);
    };
    /**
     * Parses a Sub Surface Configuration from a serialized object.
     * @param source - Serialized object.
     */
    PBRSubSurfaceConfiguration.prototype.parse = function (source) {
        var _this = this;
        SerializationHelper.Parse(function () { return _this; }, source, null);
    };
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_isRefractionEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "isRefractionEnabled", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_isTranslucencyEnabled", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "isTranslucencyEnabled", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_isScatteringEnabled", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "refractionIntensity", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "translucencyIntensity", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "scatteringIntensity", void 0);
    __decorate([
        serializeAsTexture()
    ], PBRSubSurfaceConfiguration.prototype, "_thicknessTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "thicknessTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "refractionTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "indexOfRefraction", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "invertRefractionY", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "linkRefractionWithTransparency", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "minimumThickness", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "maximumThickness", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSubSurfaceConfiguration.prototype, "tintColor", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "tintColorAtDistance", void 0);
    __decorate([
        serializeAsColor3()
    ], PBRSubSurfaceConfiguration.prototype, "diffusionDistance", void 0);
    __decorate([
        serialize()
    ], PBRSubSurfaceConfiguration.prototype, "_useMaskFromThicknessTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRSubSurfaceConfiguration.prototype, "useMaskFromThicknessTexture", void 0);
    return PBRSubSurfaceConfiguration;
}());

var name$2 = 'pbrFragmentDeclaration';
var shader$2 = "uniform vec3 vReflectionColor;\nuniform vec4 vAlbedoColor;\n\nuniform vec4 vLightingIntensity;\nuniform vec4 vReflectivityColor;\nuniform vec3 vEmissiveColor;\nuniform float visibility;\n\n#ifdef ALBEDO\nuniform vec2 vAlbedoInfos;\n#endif\n#ifdef AMBIENT\nuniform vec4 vAmbientInfos;\n#endif\n#ifdef BUMP\nuniform vec3 vBumpInfos;\nuniform vec2 vTangentSpaceParams;\n#endif\n#ifdef OPACITY\nuniform vec2 vOpacityInfos;\n#endif\n#ifdef EMISSIVE\nuniform vec2 vEmissiveInfos;\n#endif\n#ifdef LIGHTMAP\nuniform vec2 vLightmapInfos;\n#endif\n#ifdef REFLECTIVITY\nuniform vec3 vReflectivityInfos;\n#endif\n#ifdef MICROSURFACEMAP\nuniform vec2 vMicroSurfaceSamplerInfos;\n#endif\n\n#if defined(REFLECTIONMAP_SPHERICAL) || defined(REFLECTIONMAP_PROJECTION) || defined(SS_REFRACTION)\nuniform mat4 view;\n#endif\n\n#ifdef REFLECTION\nuniform vec2 vReflectionInfos;\nuniform mat4 reflectionMatrix;\nuniform vec3 vReflectionMicrosurfaceInfos;\n#if defined(USE_LOCAL_REFLECTIONMAP_CUBIC) && defined(REFLECTIONMAP_CUBIC)\nuniform vec3 vReflectionPosition;\nuniform vec3 vReflectionSize;\n#endif\n#endif\n\n#ifdef CLEARCOAT\nuniform vec2 vClearCoatParams;\nuniform vec4 vClearCoatRefractionParams;\n#ifdef CLEARCOAT_TEXTURE\nuniform vec2 vClearCoatInfos;\nuniform mat4 clearCoatMatrix;\n#endif\n#ifdef CLEARCOAT_BUMP\nuniform vec2 vClearCoatBumpInfos;\nuniform vec2 vClearCoatTangentSpaceParams;\nuniform mat4 clearCoatBumpMatrix;\n#endif\n#ifdef CLEARCOAT_TINT\nuniform vec4 vClearCoatTintParams;\nuniform float clearCoatColorAtDistance;\n#ifdef CLEARCOAT_TINT_TEXTURE\nuniform vec2 vClearCoatTintInfos;\nuniform mat4 clearCoatTintMatrix;\n#endif\n#endif\n#endif\n\n#ifdef ANISOTROPIC\nuniform vec3 vAnisotropy;\n#ifdef ANISOTROPIC_TEXTURE\nuniform vec2 vAnisotropyInfos;\nuniform mat4 anisotropyMatrix;\n#endif\n#endif\n\n#ifdef SHEEN\nuniform vec4 vSheenColor;\n#ifdef SHEEN_TEXTURE\nuniform vec2 vSheenInfos;\nuniform mat4 sheenMatrix;\n#endif\n#endif\n\n#ifdef SUBSURFACE\n#ifdef SS_REFRACTION\nuniform vec3 vRefractionMicrosurfaceInfos;\nuniform vec4 vRefractionInfos;\nuniform mat4 refractionMatrix;\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nuniform vec2 vThicknessInfos;\nuniform mat4 thicknessMatrix;;\n#endif\nuniform vec2 vThicknessParam;\nuniform vec3 vDiffusionDistance;\nuniform vec4 vTintColor;\nuniform vec3 vSubSurfaceIntensity;\n#endif";
Effect.IncludesShadersStore[name$2] = shader$2;

var name$3 = 'pbrUboDeclaration';
var shader$3 = "layout(std140,column_major) uniform;\nuniform Material\n{\nuniform vec2 vAlbedoInfos;\nuniform vec4 vAmbientInfos;\nuniform vec2 vOpacityInfos;\nuniform vec2 vEmissiveInfos;\nuniform vec2 vLightmapInfos;\nuniform vec3 vReflectivityInfos;\nuniform vec2 vMicroSurfaceSamplerInfos;\nuniform vec2 vReflectionInfos;\nuniform vec3 vReflectionPosition;\nuniform vec3 vReflectionSize;\nuniform vec3 vBumpInfos;\nuniform mat4 albedoMatrix;\nuniform mat4 ambientMatrix;\nuniform mat4 opacityMatrix;\nuniform mat4 emissiveMatrix;\nuniform mat4 lightmapMatrix;\nuniform mat4 reflectivityMatrix;\nuniform mat4 microSurfaceSamplerMatrix;\nuniform mat4 bumpMatrix;\nuniform vec2 vTangentSpaceParams;\nuniform mat4 reflectionMatrix;\nuniform vec3 vReflectionColor;\nuniform vec4 vAlbedoColor;\nuniform vec4 vLightingIntensity;\nuniform vec3 vReflectionMicrosurfaceInfos;\nuniform float pointSize;\nuniform vec4 vReflectivityColor;\nuniform vec3 vEmissiveColor;\nuniform float visibility;\nuniform vec2 vClearCoatParams;\nuniform vec4 vClearCoatRefractionParams;\nuniform vec2 vClearCoatInfos;\nuniform mat4 clearCoatMatrix;\nuniform vec2 vClearCoatBumpInfos;\nuniform vec2 vClearCoatTangentSpaceParams;\nuniform mat4 clearCoatBumpMatrix;\nuniform vec4 vClearCoatTintParams;\nuniform float clearCoatColorAtDistance;\nuniform vec2 vClearCoatTintInfos;\nuniform mat4 clearCoatTintMatrix;\nuniform vec3 vAnisotropy;\nuniform vec2 vAnisotropyInfos;\nuniform mat4 anisotropyMatrix;\nuniform vec4 vSheenColor;\nuniform vec2 vSheenInfos;\nuniform mat4 sheenMatrix;\nuniform vec3 vRefractionMicrosurfaceInfos;\nuniform vec4 vRefractionInfos;\nuniform mat4 refractionMatrix;\nuniform vec2 vThicknessInfos;\nuniform mat4 thicknessMatrix;\nuniform vec2 vThicknessParam;\nuniform vec3 vDiffusionDistance;\nuniform vec4 vTintColor;\nuniform vec3 vSubSurfaceIntensity;\n};\nuniform Scene {\nmat4 viewProjection;\n#ifdef MULTIVIEW\nmat4 viewProjectionR;\n#endif\nmat4 view;\n};";
Effect.IncludesShadersStore[name$3] = shader$3;

var name$4 = 'pbrFragmentExtraDeclaration';
var shader$4 = "uniform vec4 vEyePosition;\nuniform vec3 vAmbientColor;\nuniform vec4 vCameraInfos;\n\nvarying vec3 vPositionW;\n#if DEBUGMODE>0\nuniform vec2 vDebugMode;\nvarying vec4 vClipSpacePosition;\n#endif\n#ifdef MAINUV1\nvarying vec2 vMainUV1;\n#endif\n#ifdef MAINUV2\nvarying vec2 vMainUV2;\n#endif\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\nvarying vec3 vEnvironmentIrradiance;\n#endif\n#endif\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif";
Effect.IncludesShadersStore[name$4] = shader$4;

var name$5 = 'pbrFragmentSamplersDeclaration';
var shader$5 = "#ifdef ALBEDO\n#if ALBEDODIRECTUV == 1\n#define vAlbedoUV vMainUV1\n#elif ALBEDODIRECTUV == 2\n#define vAlbedoUV vMainUV2\n#else\nvarying vec2 vAlbedoUV;\n#endif\nuniform sampler2D albedoSampler;\n#endif\n#ifdef AMBIENT\n#if AMBIENTDIRECTUV == 1\n#define vAmbientUV vMainUV1\n#elif AMBIENTDIRECTUV == 2\n#define vAmbientUV vMainUV2\n#else\nvarying vec2 vAmbientUV;\n#endif\nuniform sampler2D ambientSampler;\n#endif\n#ifdef OPACITY\n#if OPACITYDIRECTUV == 1\n#define vOpacityUV vMainUV1\n#elif OPACITYDIRECTUV == 2\n#define vOpacityUV vMainUV2\n#else\nvarying vec2 vOpacityUV;\n#endif\nuniform sampler2D opacitySampler;\n#endif\n#ifdef EMISSIVE\n#if EMISSIVEDIRECTUV == 1\n#define vEmissiveUV vMainUV1\n#elif EMISSIVEDIRECTUV == 2\n#define vEmissiveUV vMainUV2\n#else\nvarying vec2 vEmissiveUV;\n#endif\nuniform sampler2D emissiveSampler;\n#endif\n#ifdef LIGHTMAP\n#if LIGHTMAPDIRECTUV == 1\n#define vLightmapUV vMainUV1\n#elif LIGHTMAPDIRECTUV == 2\n#define vLightmapUV vMainUV2\n#else\nvarying vec2 vLightmapUV;\n#endif\nuniform sampler2D lightmapSampler;\n#endif\n#ifdef REFLECTIVITY\n#if REFLECTIVITYDIRECTUV == 1\n#define vReflectivityUV vMainUV1\n#elif REFLECTIVITYDIRECTUV == 2\n#define vReflectivityUV vMainUV2\n#else\nvarying vec2 vReflectivityUV;\n#endif\nuniform sampler2D reflectivitySampler;\n#endif\n#ifdef MICROSURFACEMAP\n#if MICROSURFACEMAPDIRECTUV == 1\n#define vMicroSurfaceSamplerUV vMainUV1\n#elif MICROSURFACEMAPDIRECTUV == 2\n#define vMicroSurfaceSamplerUV vMainUV2\n#else\nvarying vec2 vMicroSurfaceSamplerUV;\n#endif\nuniform sampler2D microSurfaceSampler;\n#endif\n#ifdef CLEARCOAT\n#ifdef CLEARCOAT_TEXTURE\n#if CLEARCOAT_TEXTUREDIRECTUV == 1\n#define vClearCoatUV vMainUV1\n#elif CLEARCOAT_TEXTUREDIRECTUV == 2\n#define vClearCoatUV vMainUV2\n#else\nvarying vec2 vClearCoatUV;\n#endif\nuniform sampler2D clearCoatSampler;\n#endif\n#ifdef CLEARCOAT_BUMP\n#if CLEARCOAT_BUMPDIRECTUV == 1\n#define vClearCoatBumpUV vMainUV1\n#elif CLEARCOAT_BUMPDIRECTUV == 2\n#define vClearCoatBumpUV vMainUV2\n#else\nvarying vec2 vClearCoatBumpUV;\n#endif\nuniform sampler2D clearCoatBumpSampler;\n#endif\n#ifdef CLEARCOAT_TINT_TEXTURE\n#if CLEARCOAT_TINT_TEXTUREDIRECTUV == 1\n#define vClearCoatTintUV vMainUV1\n#elif CLEARCOAT_TINT_TEXTUREDIRECTUV == 2\n#define vClearCoatTintUV vMainUV2\n#else\nvarying vec2 vClearCoatTintUV;\n#endif\nuniform sampler2D clearCoatTintSampler;\n#endif\n#endif\n#ifdef SHEEN\n#ifdef SHEEN_TEXTURE\n#if SHEEN_TEXTUREDIRECTUV == 1\n#define vSheenUV vMainUV1\n#elif SHEEN_TEXTUREDIRECTUV == 2\n#define vSheenUV vMainUV2\n#else\nvarying vec2 vSheenUV;\n#endif\nuniform sampler2D sheenSampler;\n#endif\n#endif\n#ifdef ANISOTROPIC\n#ifdef ANISOTROPIC_TEXTURE\n#if ANISOTROPIC_TEXTUREDIRECTUV == 1\n#define vAnisotropyUV vMainUV1\n#elif ANISOTROPIC_TEXTUREDIRECTUV == 2\n#define vAnisotropyUV vMainUV2\n#else\nvarying vec2 vAnisotropyUV;\n#endif\nuniform sampler2D anisotropySampler;\n#endif\n#endif\n\n#ifdef REFLECTION\n#ifdef REFLECTIONMAP_3D\n#define sampleReflection(s,c) textureCube(s,c)\nuniform samplerCube reflectionSampler;\n#ifdef LODBASEDMICROSFURACE\n#define sampleReflectionLod(s,c,l) textureCubeLodEXT(s,c,l)\n#else\nuniform samplerCube reflectionSamplerLow;\nuniform samplerCube reflectionSamplerHigh;\n#endif\n#else\n#define sampleReflection(s,c) texture2D(s,c)\nuniform sampler2D reflectionSampler;\n#ifdef LODBASEDMICROSFURACE\n#define sampleReflectionLod(s,c,l) texture2DLodEXT(s,c,l)\n#else\nuniform samplerCube reflectionSamplerLow;\nuniform samplerCube reflectionSamplerHigh;\n#endif\n#endif\n#ifdef REFLECTIONMAP_SKYBOX\nvarying vec3 vPositionUVW;\n#else\n#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\nvarying vec3 vDirectionW;\n#endif\n#endif\n#endif\n#ifdef ENVIRONMENTBRDF\nuniform sampler2D environmentBrdfSampler;\n#endif\n\n#ifdef SUBSURFACE\n#ifdef SS_REFRACTION\n#ifdef SS_REFRACTIONMAP_3D\n#define sampleRefraction(s,c) textureCube(s,c)\nuniform samplerCube refractionSampler;\n#ifdef LODBASEDMICROSFURACE\n#define sampleRefractionLod(s,c,l) textureCubeLodEXT(s,c,l)\n#else\nuniform samplerCube refractionSamplerLow;\nuniform samplerCube refractionSamplerHigh;\n#endif\n#else\n#define sampleRefraction(s,c) texture2D(s,c)\nuniform sampler2D refractionSampler;\n#ifdef LODBASEDMICROSFURACE\n#define sampleRefractionLod(s,c,l) texture2DLodEXT(s,c,l)\n#else\nuniform samplerCube refractionSamplerLow;\nuniform samplerCube refractionSamplerHigh;\n#endif\n#endif\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\n#if SS_THICKNESSANDMASK_TEXTUREDIRECTUV == 1\n#define vThicknessUV vMainUV1\n#elif SS_THICKNESSANDMASK_TEXTUREDIRECTUV == 2\n#define vThicknessUV vMainUV2\n#else\nvarying vec2 vThicknessUV;\n#endif\nuniform sampler2D thicknessSampler;\n#endif\n#endif";
Effect.IncludesShadersStore[name$5] = shader$5;

var name$6 = 'pbrHelperFunctions';
var shader$6 = "\n#define RECIPROCAL_PI2 0.15915494\n#define RECIPROCAL_PI 0.31830988618\n\n#define MINIMUMVARIANCE 0.0005\nfloat convertRoughnessToAverageSlope(float roughness)\n{\n\nreturn square(roughness)+MINIMUMVARIANCE;\n}\nfloat fresnelGrazingReflectance(float reflectance0) {\n\n\nfloat reflectance90=saturate(reflectance0*25.0);\nreturn reflectance90;\n}\nvec2 getAARoughnessFactors(vec3 normalVector) {\n#ifdef SPECULARAA\nvec3 nDfdx=dFdx(normalVector.xyz);\nvec3 nDfdy=dFdy(normalVector.xyz);\nfloat slopeSquare=max(dot(nDfdx,nDfdx),dot(nDfdy,nDfdy));\n\nfloat geometricRoughnessFactor=pow(saturate(slopeSquare),0.333);\n\nfloat geometricAlphaGFactor=sqrt(slopeSquare);\n\ngeometricAlphaGFactor*=0.75;\nreturn vec2(geometricRoughnessFactor,geometricAlphaGFactor);\n#else\nreturn vec2(0.);\n#endif\n}\n#ifdef ANISOTROPIC\n\n\nvec2 getAnisotropicRoughness(float alphaG,float anisotropy) {\nfloat alphaT=max(alphaG*(1.0+anisotropy),MINIMUMVARIANCE);\nfloat alphaB=max(alphaG*(1.0-anisotropy),MINIMUMVARIANCE);\nreturn vec2(alphaT,alphaB);\n}\n\n\nvec3 getAnisotropicBentNormals(const vec3 T,const vec3 B,const vec3 N,const vec3 V,float anisotropy) {\nvec3 anisotropicFrameDirection=anisotropy>=0.0 ? B : T;\nvec3 anisotropicFrameTangent=cross(normalize(anisotropicFrameDirection),V);\nvec3 anisotropicFrameNormal=cross(anisotropicFrameTangent,anisotropicFrameDirection);\nvec3 anisotropicNormal=normalize(mix(N,anisotropicFrameNormal,abs(anisotropy)));\nreturn anisotropicNormal;\n\n}\n#endif\n#if defined(CLEARCOAT) || defined(SS_REFRACTION)\n\n\n\nvec3 cocaLambert(vec3 alpha,float distance) {\nreturn exp(-alpha*distance);\n}\n\nvec3 cocaLambert(float NdotVRefract,float NdotLRefract,vec3 alpha,float thickness) {\nreturn cocaLambert(alpha,(thickness*((NdotLRefract+NdotVRefract)/(NdotLRefract*NdotVRefract))));\n}\n\nvec3 computeColorAtDistanceInMedia(vec3 color,float distance) {\nreturn -log(color)/distance;\n}\nvec3 computeClearCoatAbsorption(float NdotVRefract,float NdotLRefract,vec3 clearCoatColor,float clearCoatThickness,float clearCoatIntensity) {\nvec3 clearCoatAbsorption=mix(vec3(1.0),\ncocaLambert(NdotVRefract,NdotLRefract,clearCoatColor,clearCoatThickness),\nclearCoatIntensity);\nreturn clearCoatAbsorption;\n}\n#endif\n\n\n\n\n#ifdef MICROSURFACEAUTOMATIC\nfloat computeDefaultMicroSurface(float microSurface,vec3 reflectivityColor)\n{\nconst float kReflectivityNoAlphaWorkflow_SmoothnessMax=0.95;\nfloat reflectivityLuminance=getLuminance(reflectivityColor);\nfloat reflectivityLuma=sqrt(reflectivityLuminance);\nmicroSurface=reflectivityLuma*kReflectivityNoAlphaWorkflow_SmoothnessMax;\nreturn microSurface;\n}\n#endif";
Effect.IncludesShadersStore[name$6] = shader$6;

var name$7 = 'harmonicsFunctions';
var shader$7 = "#ifdef USESPHERICALFROMREFLECTIONMAP\n#ifdef SPHERICAL_HARMONICS\nuniform vec3 vSphericalL00;\nuniform vec3 vSphericalL1_1;\nuniform vec3 vSphericalL10;\nuniform vec3 vSphericalL11;\nuniform vec3 vSphericalL2_2;\nuniform vec3 vSphericalL2_1;\nuniform vec3 vSphericalL20;\nuniform vec3 vSphericalL21;\nuniform vec3 vSphericalL22;\n\n\n\n\n\n\n\nvec3 computeEnvironmentIrradiance(vec3 normal) {\nreturn vSphericalL00\n+vSphericalL1_1*(normal.y)\n+vSphericalL10*(normal.z)\n+vSphericalL11*(normal.x)\n+vSphericalL2_2*(normal.y*normal.x)\n+vSphericalL2_1*(normal.y*normal.z)\n+vSphericalL20*((3.0*normal.z*normal.z)-1.0)\n+vSphericalL21*(normal.z*normal.x)\n+vSphericalL22*(normal.x*normal.x-(normal.y*normal.y));\n}\n#else\nuniform vec3 vSphericalX;\nuniform vec3 vSphericalY;\nuniform vec3 vSphericalZ;\nuniform vec3 vSphericalXX_ZZ;\nuniform vec3 vSphericalYY_ZZ;\nuniform vec3 vSphericalZZ;\nuniform vec3 vSphericalXY;\nuniform vec3 vSphericalYZ;\nuniform vec3 vSphericalZX;\n\nvec3 computeEnvironmentIrradiance(vec3 normal) {\n\n\n\n\n\n\n\n\n\nfloat Nx=normal.x;\nfloat Ny=normal.y;\nfloat Nz=normal.z;\nvec3 C1=vSphericalZZ.rgb;\nvec3 Cx=vSphericalX.rgb;\nvec3 Cy=vSphericalY.rgb;\nvec3 Cz=vSphericalZ.rgb;\nvec3 Cxx_zz=vSphericalXX_ZZ.rgb;\nvec3 Cyy_zz=vSphericalYY_ZZ.rgb;\nvec3 Cxy=vSphericalXY.rgb;\nvec3 Cyz=vSphericalYZ.rgb;\nvec3 Czx=vSphericalZX.rgb;\nvec3 a1=Cyy_zz*Ny+Cy;\nvec3 a2=Cyz*Nz+a1;\nvec3 b1=Czx*Nz+Cx;\nvec3 b2=Cxy*Ny+b1;\nvec3 b3=Cxx_zz*Nx+b2;\nvec3 t1=Cz*Nz+C1;\nvec3 t2=a2*Ny+t1;\nvec3 t3=b3*Nx+t2;\nreturn t3;\n}\n#endif\n#endif";
Effect.IncludesShadersStore[name$7] = shader$7;

var name$8 = 'pbrDirectLightingSetupFunctions';
var shader$8 = "\nstruct preLightingInfo\n{\n\nvec3 lightOffset;\nfloat lightDistanceSquared;\nfloat lightDistance;\n\nfloat attenuation;\n\nvec3 L;\nvec3 H;\nfloat NdotV;\nfloat NdotLUnclamped;\nfloat NdotL;\nfloat VdotH;\nfloat roughness;\n};\npreLightingInfo computePointAndSpotPreLightingInfo(vec4 lightData,vec3 V,vec3 N) {\npreLightingInfo result;\n\nresult.lightOffset=lightData.xyz-vPositionW;\nresult.lightDistanceSquared=dot(result.lightOffset,result.lightOffset);\n\nresult.lightDistance=sqrt(result.lightDistanceSquared);\n\nresult.L=normalize(result.lightOffset);\nresult.H=normalize(V+result.L);\nresult.VdotH=saturate(dot(V,result.H));\nresult.NdotLUnclamped=dot(N,result.L);\nresult.NdotL=saturateEps(result.NdotLUnclamped);\nreturn result;\n}\npreLightingInfo computeDirectionalPreLightingInfo(vec4 lightData,vec3 V,vec3 N) {\npreLightingInfo result;\n\nresult.lightDistance=length(-lightData.xyz);\n\nresult.L=normalize(-lightData.xyz);\nresult.H=normalize(V+result.L);\nresult.VdotH=saturate(dot(V,result.H));\nresult.NdotLUnclamped=dot(N,result.L);\nresult.NdotL=saturateEps(result.NdotLUnclamped);\nreturn result;\n}\npreLightingInfo computeHemisphericPreLightingInfo(vec4 lightData,vec3 V,vec3 N) {\npreLightingInfo result;\n\n\nresult.NdotL=dot(N,lightData.xyz)*0.5+0.5;\nresult.NdotL=saturateEps(result.NdotL);\nresult.NdotLUnclamped=result.NdotL;\n#ifdef SPECULARTERM\nresult.L=normalize(lightData.xyz);\nresult.H=normalize(V+result.L);\nresult.VdotH=saturate(dot(V,result.H));\n#endif\nreturn result;\n}";
Effect.IncludesShadersStore[name$8] = shader$8;

var name$9 = 'pbrDirectLightingFalloffFunctions';
var shader$9 = "float computeDistanceLightFalloff_Standard(vec3 lightOffset,float range)\n{\nreturn max(0.,1.0-length(lightOffset)/range);\n}\nfloat computeDistanceLightFalloff_Physical(float lightDistanceSquared)\n{\nreturn 1.0/maxEps(lightDistanceSquared);\n}\nfloat computeDistanceLightFalloff_GLTF(float lightDistanceSquared,float inverseSquaredRange)\n{\nfloat lightDistanceFalloff=1.0/maxEps(lightDistanceSquared);\nfloat factor=lightDistanceSquared*inverseSquaredRange;\nfloat attenuation=saturate(1.0-factor*factor);\nattenuation*=attenuation;\n\nlightDistanceFalloff*=attenuation;\nreturn lightDistanceFalloff;\n}\nfloat computeDistanceLightFalloff(vec3 lightOffset,float lightDistanceSquared,float range,float inverseSquaredRange)\n{\n#ifdef USEPHYSICALLIGHTFALLOFF\nreturn computeDistanceLightFalloff_Physical(lightDistanceSquared);\n#elif defined(USEGLTFLIGHTFALLOFF)\nreturn computeDistanceLightFalloff_GLTF(lightDistanceSquared,inverseSquaredRange);\n#else\nreturn computeDistanceLightFalloff_Standard(lightOffset,range);\n#endif\n}\nfloat computeDirectionalLightFalloff_Standard(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle,float exponent)\n{\nfloat falloff=0.0;\nfloat cosAngle=maxEps(dot(-lightDirection,directionToLightCenterW));\nif (cosAngle>=cosHalfAngle)\n{\nfalloff=max(0.,pow(cosAngle,exponent));\n}\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff_Physical(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle)\n{\nconst float kMinusLog2ConeAngleIntensityRatio=6.64385618977;\n\n\n\n\n\nfloat concentrationKappa=kMinusLog2ConeAngleIntensityRatio/(1.0-cosHalfAngle);\n\n\nvec4 lightDirectionSpreadSG=vec4(-lightDirection*concentrationKappa,-concentrationKappa);\nfloat falloff=exp2(dot(vec4(directionToLightCenterW,1.0),lightDirectionSpreadSG));\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff_GLTF(vec3 lightDirection,vec3 directionToLightCenterW,float lightAngleScale,float lightAngleOffset)\n{\n\n\n\nfloat cd=dot(-lightDirection,directionToLightCenterW);\nfloat falloff=saturate(cd*lightAngleScale+lightAngleOffset);\n\nfalloff*=falloff;\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle,float exponent,float lightAngleScale,float lightAngleOffset)\n{\n#ifdef USEPHYSICALLIGHTFALLOFF\nreturn computeDirectionalLightFalloff_Physical(lightDirection,directionToLightCenterW,cosHalfAngle);\n#elif defined(USEGLTFLIGHTFALLOFF)\nreturn computeDirectionalLightFalloff_GLTF(lightDirection,directionToLightCenterW,lightAngleScale,lightAngleOffset);\n#else\nreturn computeDirectionalLightFalloff_Standard(lightDirection,directionToLightCenterW,cosHalfAngle,exponent);\n#endif\n}";
Effect.IncludesShadersStore[name$9] = shader$9;

var name$a = 'pbrBRDFFunctions';
var shader$a = "\n#define FRESNEL_MAXIMUM_ON_ROUGH 0.25\n\n\n\n\n#ifdef MS_BRDF_ENERGY_CONSERVATION\n\n\nvec3 getEnergyConservationFactor(const vec3 specularEnvironmentR0,const vec3 environmentBrdf) {\nreturn 1.0+specularEnvironmentR0*(1.0/environmentBrdf.y-1.0);\n}\n#endif\n#ifdef ENVIRONMENTBRDF\nvec3 getBRDFLookup(float NdotV,float perceptualRoughness,sampler2D brdfSampler) {\n\nvec2 UV=vec2(NdotV,perceptualRoughness);\n\nvec4 brdfLookup=texture2D(brdfSampler,UV);\n#ifdef ENVIRONMENTBRDF_RGBD\nbrdfLookup.rgb=fromRGBD(brdfLookup.rgba);\n#endif\nreturn brdfLookup.rgb;\n}\nvec3 getReflectanceFromBRDFLookup(const vec3 specularEnvironmentR0,const vec3 environmentBrdf) {\n#ifdef BRDF_V_HEIGHT_CORRELATED\nvec3 reflectance=mix(environmentBrdf.xxx,environmentBrdf.yyy,specularEnvironmentR0);\n#else\nvec3 reflectance=specularEnvironmentR0*environmentBrdf.x+environmentBrdf.y;\n#endif\nreturn reflectance;\n}\n#endif\n#if !defined(ENVIRONMENTBRDF) || defined(REFLECTIONMAP_SKYBOX) || defined(ALPHAFRESNEL)\nvec3 getReflectanceFromAnalyticalBRDFLookup_Jones(float VdotN,vec3 reflectance0,vec3 reflectance90,float smoothness)\n{\n\nfloat weight=mix(FRESNEL_MAXIMUM_ON_ROUGH,1.0,smoothness);\nreturn reflectance0+weight*(reflectance90-reflectance0)*pow5(saturate(1.0-VdotN));\n}\n#endif\n#if defined(SHEEN) && defined(REFLECTION)\n\nvec3 getSheenReflectanceFromBRDFLookup(const vec3 reflectance0,const vec3 environmentBrdf) {\nvec3 sheenEnvironmentReflectance=reflectance0*environmentBrdf.b;\nreturn sheenEnvironmentReflectance;\n}\n#endif\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvec3 fresnelSchlickGGX(float VdotH,vec3 reflectance0,vec3 reflectance90)\n{\nreturn reflectance0+(reflectance90-reflectance0)*pow5(1.0-VdotH);\n}\nfloat fresnelSchlickGGX(float VdotH,float reflectance0,float reflectance90)\n{\nreturn reflectance0+(reflectance90-reflectance0)*pow5(1.0-VdotH);\n}\n#ifdef CLEARCOAT\n\n\n\n\n\nvec3 getR0RemappedForClearCoat(vec3 f0) {\n#ifdef CLEARCOAT_DEFAULTIOR\n#ifdef MOBILE\nreturn saturate(f0*(f0*0.526868+0.529324)-0.0482256);\n#else\nreturn saturate(f0*(f0*(0.941892-0.263008*f0)+0.346479)-0.0285998);\n#endif\n#else\nvec3 s=sqrt(f0);\nvec3 t=(vClearCoatRefractionParams.z+vClearCoatRefractionParams.w*s)/(vClearCoatRefractionParams.w+vClearCoatRefractionParams.z*s);\nreturn t*t;\n#endif\n}\n#endif\n\n\n\n\n\n\nfloat normalDistributionFunction_TrowbridgeReitzGGX(float NdotH,float alphaG)\n{\n\n\n\nfloat a2=square(alphaG);\nfloat d=NdotH*NdotH*(a2-1.0)+1.0;\nreturn a2/(PI*d*d);\n}\n#ifdef SHEEN\n\nfloat normalDistributionFunction_CharlieSheen(float NdotH,float alphaG)\n{\nfloat invR=1./alphaG;\nfloat cos2h=NdotH*NdotH;\nfloat sin2h=1.-cos2h;\nreturn (2.+invR)*pow(sin2h,invR*.5)/(2.*PI);\n}\n#endif\n#ifdef ANISOTROPIC\n\n\nfloat normalDistributionFunction_BurleyGGX_Anisotropic(float NdotH,float TdotH,float BdotH,const vec2 alphaTB) {\nfloat a2=alphaTB.x*alphaTB.y;\nvec3 v=vec3(alphaTB.y*TdotH,alphaTB.x*BdotH,a2*NdotH);\nfloat v2=dot(v,v);\nfloat w2=a2/v2;\nreturn a2*w2*w2*RECIPROCAL_PI;\n}\n#endif\n\n\n\n\n#ifdef BRDF_V_HEIGHT_CORRELATED\n\n\n\nfloat smithVisibility_GGXCorrelated(float NdotL,float NdotV,float alphaG) {\n#ifdef MOBILE\n\nfloat GGXV=NdotL*(NdotV*(1.0-alphaG)+alphaG);\nfloat GGXL=NdotV*(NdotL*(1.0-alphaG)+alphaG);\nreturn 0.5/(GGXV+GGXL);\n#else\nfloat a2=alphaG*alphaG;\nfloat GGXV=NdotL*sqrt(NdotV*(NdotV-a2*NdotV)+a2);\nfloat GGXL=NdotV*sqrt(NdotL*(NdotL-a2*NdotL)+a2);\nreturn 0.5/(GGXV+GGXL);\n#endif\n}\n#else\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nfloat smithVisibilityG1_TrowbridgeReitzGGXFast(float dot,float alphaG)\n{\n#ifdef MOBILE\n\nreturn 1.0/(dot+alphaG+(1.0-alphaG)*dot ));\n#else\nfloat alphaSquared=alphaG*alphaG;\nreturn 1.0/(dot+sqrt(alphaSquared+(1.0-alphaSquared)*dot*dot));\n#endif\n}\nfloat smithVisibility_TrowbridgeReitzGGXFast(float NdotL,float NdotV,float alphaG)\n{\nfloat visibility=smithVisibilityG1_TrowbridgeReitzGGXFast(NdotL,alphaG)*smithVisibilityG1_TrowbridgeReitzGGXFast(NdotV,alphaG);\n\nreturn visibility;\n}\n#endif\n#ifdef ANISOTROPIC\n\n\nfloat smithVisibility_GGXCorrelated_Anisotropic(float NdotL,float NdotV,float TdotV,float BdotV,float TdotL,float BdotL,const vec2 alphaTB) {\nfloat lambdaV=NdotL*length(vec3(alphaTB.x*TdotV,alphaTB.y*BdotV,NdotV));\nfloat lambdaL=NdotV*length(vec3(alphaTB.x*TdotL,alphaTB.y*BdotL,NdotL));\nfloat v=0.5/(lambdaV+lambdaL);\nreturn v;\n}\n#endif\n#ifdef CLEARCOAT\nfloat visibility_Kelemen(float VdotH) {\n\n\n\nreturn 0.25/(VdotH*VdotH);\n}\n#endif\n#ifdef SHEEN\n\n\n\nfloat visibility_Ashikhmin(float NdotL,float NdotV)\n{\nreturn 1./(4.*(NdotL+NdotV-NdotL*NdotV));\n}\n#endif\n\n\n\n\n\n\n\nfloat diffuseBRDF_Burley(float NdotL,float NdotV,float VdotH,float roughness) {\n\n\nfloat diffuseFresnelNV=pow5(saturateEps(1.0-NdotL));\nfloat diffuseFresnelNL=pow5(saturateEps(1.0-NdotV));\nfloat diffuseFresnel90=0.5+2.0*VdotH*VdotH*roughness;\nfloat fresnel =\n(1.0+(diffuseFresnel90-1.0)*diffuseFresnelNL) *\n(1.0+(diffuseFresnel90-1.0)*diffuseFresnelNV);\nreturn fresnel/PI;\n}\n#ifdef SS_TRANSLUCENCY\n\n\nvec3 transmittanceBRDF_Burley(const vec3 tintColor,const vec3 diffusionDistance,float thickness) {\nvec3 S=1./maxEps(diffusionDistance);\nvec3 temp=exp((-0.333333333*thickness)*S);\nreturn tintColor.rgb*0.25*(temp*temp*temp+3.0*temp);\n}\n\n\nfloat computeWrappedDiffuseNdotL(float NdotL,float w) {\nfloat t=1.0+w;\nfloat invt2=1.0/square(t);\nreturn saturate((NdotL+w)*invt2);\n}\n#endif\n";
Effect.IncludesShadersStore[name$a] = shader$a;

var name$b = 'pbrDirectLightingFunctions';
var shader$b = "#define CLEARCOATREFLECTANCE90 1.0\n\nstruct lightingInfo\n{\nvec3 diffuse;\n#ifdef SPECULARTERM\nvec3 specular;\n#endif\n#ifdef CLEARCOAT\n\n\nvec4 clearCoat;\n#endif\n#ifdef SHEEN\nvec3 sheen;\n#endif\n};\n\nfloat adjustRoughnessFromLightProperties(float roughness,float lightRadius,float lightDistance) {\n#if defined(USEPHYSICALLIGHTFALLOFF) || defined(USEGLTFLIGHTFALLOFF)\n\nfloat lightRoughness=lightRadius/lightDistance;\n\nfloat totalRoughness=saturate(lightRoughness+roughness);\nreturn totalRoughness;\n#else\nreturn roughness;\n#endif\n}\nvec3 computeHemisphericDiffuseLighting(preLightingInfo info,vec3 lightColor,vec3 groundColor) {\nreturn mix(groundColor,lightColor,info.NdotL);\n}\nvec3 computeDiffuseLighting(preLightingInfo info,vec3 lightColor) {\nfloat diffuseTerm=diffuseBRDF_Burley(info.NdotL,info.NdotV,info.VdotH,info.roughness);\nreturn diffuseTerm*info.attenuation*info.NdotL*lightColor;\n}\nvec3 computeProjectionTextureDiffuseLighting(sampler2D projectionLightSampler,mat4 textureProjectionMatrix){\nvec4 strq=textureProjectionMatrix*vec4(vPositionW,1.0);\nstrq/=strq.w;\nvec3 textureColor=texture2D(projectionLightSampler,strq.xy).rgb;\nreturn toLinearSpace(textureColor);\n}\n#ifdef SS_TRANSLUCENCY\nvec3 computeDiffuseAndTransmittedLighting(preLightingInfo info,vec3 lightColor,vec3 transmittance) {\nfloat NdotL=absEps(info.NdotLUnclamped);\n\nfloat wrapNdotL=computeWrappedDiffuseNdotL(NdotL,0.02);\n\nfloat trAdapt=step(0.,info.NdotLUnclamped);\nvec3 transmittanceNdotL=mix(transmittance*wrapNdotL,vec3(wrapNdotL),trAdapt);\nfloat diffuseTerm=diffuseBRDF_Burley(NdotL,info.NdotV,info.VdotH,info.roughness);\nreturn diffuseTerm*transmittanceNdotL*info.attenuation*lightColor;\n}\n#endif\n#ifdef SPECULARTERM\nvec3 computeSpecularLighting(preLightingInfo info,vec3 N,vec3 reflectance0,vec3 reflectance90,float geometricRoughnessFactor,vec3 lightColor) {\nfloat NdotH=saturateEps(dot(N,info.H));\nfloat roughness=max(info.roughness,geometricRoughnessFactor);\nfloat alphaG=convertRoughnessToAverageSlope(roughness);\nvec3 fresnel=fresnelSchlickGGX(info.VdotH,reflectance0,reflectance90);\nfloat distribution=normalDistributionFunction_TrowbridgeReitzGGX(NdotH,alphaG);\n#ifdef BRDF_V_HEIGHT_CORRELATED\nfloat visibility=smithVisibility_GGXCorrelated(info.NdotL,info.NdotV,alphaG);\n#else\nfloat visibility=smithVisibility_TrowbridgeReitzGGXFast(info.NdotL,info.NdotV,alphaG);\n#endif\nvec3 specTerm=fresnel*distribution*visibility;\nreturn specTerm*info.attenuation*info.NdotL*lightColor;\n}\n#endif\n#ifdef ANISOTROPIC\nvec3 computeAnisotropicSpecularLighting(preLightingInfo info,vec3 V,vec3 N,vec3 T,vec3 B,float anisotropy,vec3 reflectance0,vec3 reflectance90,float geometricRoughnessFactor,vec3 lightColor) {\nfloat NdotH=saturateEps(dot(N,info.H));\nfloat TdotH=dot(T,info.H);\nfloat BdotH=dot(B,info.H);\nfloat TdotV=dot(T,V);\nfloat BdotV=dot(B,V);\nfloat TdotL=dot(T,info.L);\nfloat BdotL=dot(B,info.L);\nfloat alphaG=convertRoughnessToAverageSlope(info.roughness);\nvec2 alphaTB=getAnisotropicRoughness(alphaG,anisotropy);\nalphaTB=max(alphaTB,square(geometricRoughnessFactor));\nvec3 fresnel=fresnelSchlickGGX(info.VdotH,reflectance0,reflectance90);\nfloat distribution=normalDistributionFunction_BurleyGGX_Anisotropic(NdotH,TdotH,BdotH,alphaTB);\nfloat visibility=smithVisibility_GGXCorrelated_Anisotropic(info.NdotL,info.NdotV,TdotV,BdotV,TdotL,BdotL,alphaTB);\nvec3 specTerm=fresnel*distribution*visibility;\nreturn specTerm*info.attenuation*info.NdotL*lightColor;\n}\n#endif\n#ifdef CLEARCOAT\nvec4 computeClearCoatLighting(preLightingInfo info,vec3 Ncc,float geometricRoughnessFactor,float clearCoatIntensity,vec3 lightColor) {\nfloat NccdotL=saturateEps(dot(Ncc,info.L));\nfloat NccdotH=saturateEps(dot(Ncc,info.H));\nfloat clearCoatRoughness=max(info.roughness,geometricRoughnessFactor);\nfloat alphaG=convertRoughnessToAverageSlope(clearCoatRoughness);\nfloat fresnel=fresnelSchlickGGX(info.VdotH,vClearCoatRefractionParams.x,CLEARCOATREFLECTANCE90);\nfresnel*=clearCoatIntensity;\nfloat distribution=normalDistributionFunction_TrowbridgeReitzGGX(NccdotH,alphaG);\nfloat visibility=visibility_Kelemen(info.VdotH);\nfloat clearCoatTerm=fresnel*distribution*visibility;\nreturn vec4(\nclearCoatTerm*info.attenuation*NccdotL*lightColor,\n1.0-fresnel\n);\n}\nvec3 computeClearCoatLightingAbsorption(float NdotVRefract,vec3 L,vec3 Ncc,vec3 clearCoatColor,float clearCoatThickness,float clearCoatIntensity) {\nvec3 LRefract=-refract(L,Ncc,vClearCoatRefractionParams.y);\nfloat NdotLRefract=saturateEps(dot(Ncc,LRefract));\nvec3 absorption=computeClearCoatAbsorption(NdotVRefract,NdotLRefract,clearCoatColor,clearCoatThickness,clearCoatIntensity);\nreturn absorption;\n}\n#endif\n#ifdef SHEEN\nvec3 computeSheenLighting(preLightingInfo info,vec3 N,vec3 reflectance0,vec3 reflectance90,float geometricRoughnessFactor,vec3 lightColor) {\nfloat NdotH=saturateEps(dot(N,info.H));\nfloat roughness=max(info.roughness,geometricRoughnessFactor);\nfloat alphaG=convertRoughnessToAverageSlope(roughness);\n\n\nvec3 fresnel=reflectance0;\nfloat distribution=normalDistributionFunction_CharlieSheen(NdotH,alphaG);\nfloat visibility=visibility_Ashikhmin(info.NdotL,info.NdotV);\nvec3 sheenTerm=fresnel*distribution*visibility;\nreturn sheenTerm*info.attenuation*info.NdotL*lightColor;\n}\n#endif\n";
Effect.IncludesShadersStore[name$b] = shader$b;

var name$c = 'pbrIBLFunctions';
var shader$c = "#if defined(REFLECTION) || defined(SS_REFRACTION)\nfloat getLodFromAlphaG(float cubeMapDimensionPixels,float microsurfaceAverageSlope) {\nfloat microsurfaceAverageSlopeTexels=microsurfaceAverageSlope*cubeMapDimensionPixels;\nfloat lod=log2(microsurfaceAverageSlopeTexels);\nreturn lod;\n}\n#endif\n#if defined(ENVIRONMENTBRDF) && defined(RADIANCEOCCLUSION)\nfloat environmentRadianceOcclusion(float ambientOcclusion,float NdotVUnclamped) {\n\n\nfloat temp=NdotVUnclamped+ambientOcclusion;\nreturn saturate(square(temp)-1.0+ambientOcclusion);\n}\n#endif\n#if defined(ENVIRONMENTBRDF) && defined(HORIZONOCCLUSION)\nfloat environmentHorizonOcclusion(vec3 view,vec3 normal) {\n\nvec3 reflection=reflect(view,normal);\nfloat temp=saturate(1.0+1.1*dot(reflection,normal));\nreturn square(temp);\n}\n#endif\n\n\n\n\n#if defined(LODINREFLECTIONALPHA) || defined(SS_LODINREFRACTIONALPHA)\n\n\n#define UNPACK_LOD(x) (1.0-x)*255.0\nfloat getLodFromAlphaG(float cubeMapDimensionPixels,float alphaG,float NdotV) {\nfloat microsurfaceAverageSlope=alphaG;\n\n\n\n\n\n\nmicrosurfaceAverageSlope*=sqrt(abs(NdotV));\nreturn getLodFromAlphaG(cubeMapDimensionPixels,microsurfaceAverageSlope);\n}\n#endif";
Effect.IncludesShadersStore[name$c] = shader$c;

var name$d = 'pbrDebug';
var shader$d = "#if DEBUGMODE>0\nif (vClipSpacePosition.x/vClipSpacePosition.w<vDebugMode.x) {\nreturn;\n}\n\n#if DEBUGMODE == 1\ngl_FragColor.rgb=vPositionW.rgb;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 2 && defined(NORMAL)\ngl_FragColor.rgb=vNormalW.rgb;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 3 && (defined(BUMP) || defined(PARALLAX) || defined(ANISOTROPIC))\n\ngl_FragColor.rgb=TBN[0];\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 4 && (defined(BUMP) || defined(PARALLAX) || defined(ANISOTROPIC))\n\ngl_FragColor.rgb=TBN[1];\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 5\n\ngl_FragColor.rgb=normalW;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 6 && defined(MAINUV1)\ngl_FragColor.rgb=vec3(vMainUV1,0.0);\n#elif DEBUGMODE == 7 && defined(MAINUV2)\ngl_FragColor.rgb=vec3(vMainUV2,0.0);\n#elif DEBUGMODE == 8 && defined(CLEARCOAT) && defined(CLEARCOAT_BUMP)\n\ngl_FragColor.rgb=TBNClearCoat[0];\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 9 && defined(CLEARCOAT) && defined(CLEARCOAT_BUMP)\n\ngl_FragColor.rgb=TBNClearCoat[1];\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 10 && defined(CLEARCOAT)\n\ngl_FragColor.rgb=clearCoatNormalW;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 11 && defined(ANISOTROPIC)\ngl_FragColor.rgb=anisotropicNormal;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 12 && defined(ANISOTROPIC)\ngl_FragColor.rgb=anisotropicTangent;\n#define DEBUGMODE_NORMALIZE\n#elif DEBUGMODE == 13 && defined(ANISOTROPIC)\ngl_FragColor.rgb=anisotropicBitangent;\n#define DEBUGMODE_NORMALIZE\n\n#elif DEBUGMODE == 20 && defined(ALBEDO)\ngl_FragColor.rgb=albedoTexture.rgb;\n#elif DEBUGMODE == 21 && defined(AMBIENT)\ngl_FragColor.rgb=ambientOcclusionColorMap.rgb;\n#elif DEBUGMODE == 22 && defined(OPACITY)\ngl_FragColor.rgb=opacityMap.rgb;\n#elif DEBUGMODE == 23 && defined(EMISSIVE)\ngl_FragColor.rgb=emissiveColorTex.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 24 && defined(LIGHTMAP)\ngl_FragColor.rgb=lightmapColor.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 25 && defined(REFLECTIVITY) && defined(METALLICWORKFLOW)\ngl_FragColor.rgb=surfaceMetallicColorMap.rgb;\n#elif DEBUGMODE == 26 && defined(REFLECTIVITY) && !defined(METALLICWORKFLOW)\ngl_FragColor.rgb=surfaceReflectivityColorMap.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 27 && defined(CLEARCOAT) && defined(CLEARCOAT_TEXTURE)\ngl_FragColor.rgb=vec3(clearCoatMapData.rg,0.0);\n#elif DEBUGMODE == 28 && defined(CLEARCOAT) && defined(CLEARCOAT_TINT) && defined(CLEARCOAT_TINT_TEXTURE)\ngl_FragColor.rgb=clearCoatTintMapData.rgb;\n#elif DEBUGMODE == 29 && defined(SHEEN) && defined(SHEEN_TEXTURE)\ngl_FragColor.rgb=sheenMapData.rgb;\n#elif DEBUGMODE == 30 && defined(ANISOTROPIC) && defined(ANISOTROPIC_TEXTURE)\ngl_FragColor.rgb=anisotropyMapData.rgb;\n#elif DEBUGMODE == 31 && defined(SUBSURFACE) && defined(SS_THICKNESSANDMASK_TEXTURE)\ngl_FragColor.rgb=thicknessMap.rgb;\n\n#elif DEBUGMODE == 40 && defined(SS_REFRACTION)\n\ngl_FragColor.rgb=environmentRefraction.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 41 && defined(REFLECTION)\ngl_FragColor.rgb=environmentRadiance.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 42 && defined(CLEARCOAT) && defined(REFLECTION)\ngl_FragColor.rgb=environmentClearCoatRadiance;\n#define DEBUGMODE_GAMMA\n\n#elif DEBUGMODE == 50\ngl_FragColor.rgb=diffuseBase.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 51 && defined(SPECULARTERM)\ngl_FragColor.rgb=specularBase.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 52 && defined(CLEARCOAT)\ngl_FragColor.rgb=clearCoatBase.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 53 && defined(SHEEN)\ngl_FragColor.rgb=sheenBase.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 54 && defined(REFLECTION)\ngl_FragColor.rgb=environmentIrradiance.rgb;\n#define DEBUGMODE_GAMMA\n\n#elif DEBUGMODE == 60\ngl_FragColor.rgb=surfaceAlbedo.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 61\ngl_FragColor.rgb=specularEnvironmentR0;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 62\ngl_FragColor.rgb=vec3(roughness);\n#elif DEBUGMODE == 63\ngl_FragColor.rgb=vec3(alphaG);\n#elif DEBUGMODE == 64\ngl_FragColor.rgb=vec3(NdotV);\n#elif DEBUGMODE == 65 && defined(CLEARCOAT) && defined(CLEARCOAT_TINT)\ngl_FragColor.rgb=clearCoatColor.rgb;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 66 && defined(CLEARCOAT)\ngl_FragColor.rgb=vec3(clearCoatRoughness);\n#elif DEBUGMODE == 67 && defined(CLEARCOAT)\ngl_FragColor.rgb=vec3(clearCoatNdotV);\n#elif DEBUGMODE == 68 && defined(SUBSURFACE) && defined(SS_TRANSLUCENCY)\ngl_FragColor.rgb=transmittance;\n#elif DEBUGMODE == 69 && defined(SUBSURFACE) && defined(SS_REFRACTION)\ngl_FragColor.rgb=refractionTransmittance;\n\n#elif DEBUGMODE == 70 && defined(RADIANCEOCCLUSION)\ngl_FragColor.rgb=vec3(seo);\n#elif DEBUGMODE == 71 && defined(HORIZONOCCLUSION)\ngl_FragColor.rgb=vec3(eho);\n#elif DEBUGMODE == 72 && defined(MS_BRDF_ENERGY_CONSERVATION)\ngl_FragColor.rgb=vec3(energyConservationFactor);\n#elif DEBUGMODE == 73 && defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\ngl_FragColor.rgb=specularEnvironmentReflectance;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 74 && defined(CLEARCOAT) && defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\ngl_FragColor.rgb=clearCoatEnvironmentReflectance;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 75 && defined(SHEEN) && defined(REFLECTION)\ngl_FragColor.rgb=sheenEnvironmentReflectance;\n#define DEBUGMODE_GAMMA\n#elif DEBUGMODE == 76 && defined(ALPHABLEND)\ngl_FragColor.rgb=vec3(luminanceOverAlpha);\n#elif DEBUGMODE == 77\ngl_FragColor.rgb=vec3(alpha);\n#endif\ngl_FragColor.rgb*=vDebugMode.y;\n#ifdef DEBUGMODE_NORMALIZE\ngl_FragColor.rgb=normalize(gl_FragColor.rgb)*0.5+0.5;\n#endif\n#ifdef DEBUGMODE_GAMMA\ngl_FragColor.rgb=toGammaSpace(gl_FragColor.rgb);\n#endif\ngl_FragColor.a=1.0;\n#endif";
Effect.IncludesShadersStore[name$d] = shader$d;

var name$e = 'pbrPixelShader';
var shader$e = "#if defined(BUMP) || !defined(NORMAL) || defined(FORCENORMALFORWARD) || defined(SPECULARAA) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC)\n#extension GL_OES_standard_derivatives : enable\n#endif\n#ifdef LODBASEDMICROSFURACE\n#extension GL_EXT_shader_texture_lod : enable\n#endif\n#define CUSTOM_FRAGMENT_BEGIN\n#ifdef LOGARITHMICDEPTH\n#extension GL_EXT_frag_depth : enable\n#endif\nprecision highp float;\n\n#ifndef FROMLINEARSPACE\n#define FROMLINEARSPACE;\n#endif\n\n#include<__decl__pbrFragment>\n#include<pbrFragmentExtraDeclaration>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#include<pbrFragmentSamplersDeclaration>\n#include<imageProcessingDeclaration>\n#include<clipPlaneFragmentDeclaration>\n#include<logDepthDeclaration>\n#include<fogFragmentDeclaration>\n\n#include<helperFunctions>\n#include<pbrHelperFunctions>\n#include<imageProcessingFunctions>\n#include<shadowsFragmentFunctions>\n#include<harmonicsFunctions>\n#include<pbrDirectLightingSetupFunctions>\n#include<pbrDirectLightingFalloffFunctions>\n#include<pbrBRDFFunctions>\n#include<pbrDirectLightingFunctions>\n#include<pbrIBLFunctions>\n#include<bumpFragmentFunctions>\n#ifdef REFLECTION\n#include<reflectionFunction>\n#endif\n#define CUSTOM_FRAGMENT_DEFINITIONS\n\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\n#include<clipPlaneFragment>\n\nvec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);\n#ifdef NORMAL\nvec3 normalW=normalize(vNormalW);\n#else\nvec3 normalW=normalize(cross(dFdx(vPositionW),dFdy(vPositionW)))*vEyePosition.w;\n#endif\n#ifdef CLEARCOAT\n\nvec3 clearCoatNormalW=normalW;\n#endif\n#include<bumpFragment>\n#if defined(FORCENORMALFORWARD) && defined(NORMAL)\nvec3 faceNormal=normalize(cross(dFdx(vPositionW),dFdy(vPositionW)))*vEyePosition.w;\n#if defined(TWOSIDEDLIGHTING)\nfaceNormal=gl_FrontFacing ? faceNormal : -faceNormal;\n#endif\nnormalW*=sign(dot(normalW,faceNormal));\n#endif\n#if defined(TWOSIDEDLIGHTING) && defined(NORMAL)\nnormalW=gl_FrontFacing ? normalW : -normalW;\n#endif\n\n\nvec3 surfaceAlbedo=vAlbedoColor.rgb;\n\nfloat alpha=vAlbedoColor.a;\n#ifdef ALBEDO\nvec4 albedoTexture=texture2D(albedoSampler,vAlbedoUV+uvOffset);\n#if defined(ALPHAFROMALBEDO) || defined(ALPHATEST)\nalpha*=albedoTexture.a;\n#endif\nsurfaceAlbedo*=toLinearSpace(albedoTexture.rgb);\nsurfaceAlbedo*=vAlbedoInfos.y;\n#endif\n#ifdef VERTEXCOLOR\nsurfaceAlbedo*=vColor.rgb;\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_ALBEDO\n\n#ifdef OPACITY\nvec4 opacityMap=texture2D(opacitySampler,vOpacityUV+uvOffset);\n#ifdef OPACITYRGB\nalpha=getLuminance(opacityMap.rgb);\n#else\nalpha*=opacityMap.a;\n#endif\nalpha*=vOpacityInfos.y;\n#endif\n#ifdef VERTEXALPHA\nalpha*=vColor.a;\n#endif\n#if !defined(SS_LINKREFRACTIONTOTRANSPARENCY) && !defined(ALPHAFRESNEL)\n#ifdef ALPHATEST\nif (alpha<ALPHATESTVALUE)\ndiscard;\n#ifndef ALPHABLEND\n\nalpha=1.0;\n#endif\n#endif\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_ALPHA\n#include<depthPrePass>\n#define CUSTOM_FRAGMENT_BEFORE_LIGHTS\n\nvec3 ambientOcclusionColor=vec3(1.,1.,1.);\n#ifdef AMBIENT\nvec3 ambientOcclusionColorMap=texture2D(ambientSampler,vAmbientUV+uvOffset).rgb*vAmbientInfos.y;\n#ifdef AMBIENTINGRAYSCALE\nambientOcclusionColorMap=vec3(ambientOcclusionColorMap.r,ambientOcclusionColorMap.r,ambientOcclusionColorMap.r);\n#endif\nambientOcclusionColor=mix(ambientOcclusionColor,ambientOcclusionColorMap,vAmbientInfos.z);\n#endif\n#ifdef UNLIT\nvec3 diffuseBase=vec3(1.,1.,1.);\n#else\n\nfloat microSurface=vReflectivityColor.a;\nvec3 surfaceReflectivityColor=vReflectivityColor.rgb;\n#ifdef METALLICWORKFLOW\nvec2 metallicRoughness=surfaceReflectivityColor.rg;\n#ifdef REFLECTIVITY\nvec4 surfaceMetallicColorMap=texture2D(reflectivitySampler,vReflectivityUV+uvOffset);\n#ifdef AOSTOREINMETALMAPRED\nvec3 aoStoreInMetalMap=vec3(surfaceMetallicColorMap.r,surfaceMetallicColorMap.r,surfaceMetallicColorMap.r);\nambientOcclusionColor=mix(ambientOcclusionColor,aoStoreInMetalMap,vReflectivityInfos.z);\n#endif\n#ifdef METALLNESSSTOREINMETALMAPBLUE\nmetallicRoughness.r*=surfaceMetallicColorMap.b;\n#else\nmetallicRoughness.r*=surfaceMetallicColorMap.r;\n#endif\n#ifdef ROUGHNESSSTOREINMETALMAPALPHA\nmetallicRoughness.g*=surfaceMetallicColorMap.a;\n#else\n#ifdef ROUGHNESSSTOREINMETALMAPGREEN\nmetallicRoughness.g*=surfaceMetallicColorMap.g;\n#endif\n#endif\n#endif\n#ifdef MICROSURFACEMAP\nvec4 microSurfaceTexel=texture2D(microSurfaceSampler,vMicroSurfaceSamplerUV+uvOffset)*vMicroSurfaceSamplerInfos.y;\nmetallicRoughness.g*=microSurfaceTexel.r;\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS\n\nmicroSurface=1.0-metallicRoughness.g;\n\nvec3 baseColor=surfaceAlbedo;\n#ifdef REFLECTANCE\n\n\n\n\n\nsurfaceAlbedo=baseColor.rgb*(1.0-metallicRoughness.r);\n\nsurfaceReflectivityColor=mix(0.16*reflectance*reflectance,baseColor,metallicRoughness.r);\n#else\n\n\n\nconst vec3 DefaultSpecularReflectanceDielectric=vec3(0.04,0.04,0.04);\n\nsurfaceAlbedo=mix(baseColor.rgb*(1.0-DefaultSpecularReflectanceDielectric.r),vec3(0.,0.,0.),metallicRoughness.r);\n\nsurfaceReflectivityColor=mix(DefaultSpecularReflectanceDielectric,baseColor,metallicRoughness.r);\n#endif\n#else\n#ifdef REFLECTIVITY\nvec4 surfaceReflectivityColorMap=texture2D(reflectivitySampler,vReflectivityUV+uvOffset);\nsurfaceReflectivityColor*=toLinearSpace(surfaceReflectivityColorMap.rgb);\nsurfaceReflectivityColor*=vReflectivityInfos.y;\n#ifdef MICROSURFACEFROMREFLECTIVITYMAP\nmicroSurface*=surfaceReflectivityColorMap.a;\nmicroSurface*=vReflectivityInfos.z;\n#else\n#ifdef MICROSURFACEAUTOMATIC\nmicroSurface*=computeDefaultMicroSurface(microSurface,surfaceReflectivityColor);\n#endif\n#ifdef MICROSURFACEMAP\nvec4 microSurfaceTexel=texture2D(microSurfaceSampler,vMicroSurfaceSamplerUV+uvOffset)*vMicroSurfaceSamplerInfos.y;\nmicroSurface*=microSurfaceTexel.r;\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_MICROSURFACE\n#endif\n#endif\n#endif\n\nmicroSurface=saturate(microSurface);\n\nfloat roughness=1.-microSurface;\n\n#ifdef ALPHAFRESNEL\n#if defined(ALPHATEST) || defined(ALPHABLEND)\n\n\n\nfloat opacityPerceptual=alpha;\n#ifdef LINEARALPHAFRESNEL\nfloat opacity0=opacityPerceptual;\n#else\nfloat opacity0=opacityPerceptual*opacityPerceptual;\n#endif\nfloat opacity90=fresnelGrazingReflectance(opacity0);\nvec3 normalForward=faceforward(normalW,-viewDirectionW,normalW);\n\nalpha=getReflectanceFromAnalyticalBRDFLookup_Jones(saturate(dot(viewDirectionW,normalForward)),vec3(opacity0),vec3(opacity90),sqrt(microSurface)).x;\n#ifdef ALPHATEST\nif (alpha<ALPHATESTVALUE)\ndiscard;\n#ifndef ALPHABLEND\n\nalpha=1.0;\n#endif\n#endif\n#endif\n#endif\n\nfloat NdotVUnclamped=dot(normalW,viewDirectionW);\n\nfloat NdotV=absEps(NdotVUnclamped);\nfloat alphaG=convertRoughnessToAverageSlope(roughness);\nvec2 AARoughnessFactors=getAARoughnessFactors(normalW.xyz);\n#ifdef SPECULARAA\n\nalphaG+=AARoughnessFactors.y;\n#endif\n#ifdef ANISOTROPIC\nfloat anisotropy=vAnisotropy.b;\nvec3 anisotropyDirection=vec3(vAnisotropy.xy,0.);\n#ifdef ANISOTROPIC_TEXTURE\nvec3 anisotropyMapData=texture2D(anisotropySampler,vAnisotropyUV+uvOffset).rgb*vAnisotropyInfos.y;\nanisotropy*=anisotropyMapData.b;\nanisotropyDirection.rg*=anisotropyMapData.rg*2.0-1.0;\n#endif\nmat3 anisoTBN=mat3(normalize(TBN[0]),normalize(TBN[1]),normalize(TBN[2]));\nvec3 anisotropicTangent=normalize(anisoTBN*anisotropyDirection);\nvec3 anisotropicBitangent=normalize(cross(anisoTBN[2],anisotropicTangent));\nvec3 anisotropicNormal=getAnisotropicBentNormals(anisotropicTangent,anisotropicBitangent,normalW,viewDirectionW,anisotropy);\n#endif\n\n#ifdef SS_REFRACTION\nvec4 environmentRefraction=vec4(0.,0.,0.,0.);\n#ifdef ANISOTROPIC\nvec3 refractionVector=refract(-viewDirectionW,anisotropicNormal,vRefractionInfos.y);\n#else\nvec3 refractionVector=refract(-viewDirectionW,normalW,vRefractionInfos.y);\n#endif\n#ifdef SS_REFRACTIONMAP_OPPOSITEZ\nrefractionVector.z*=-1.0;\n#endif\n\n#ifdef SS_REFRACTIONMAP_3D\nrefractionVector.y=refractionVector.y*vRefractionInfos.w;\nvec3 refractionCoords=refractionVector;\nrefractionCoords=vec3(refractionMatrix*vec4(refractionCoords,0));\n#else\nvec3 vRefractionUVW=vec3(refractionMatrix*(view*vec4(vPositionW+refractionVector*vRefractionInfos.z,1.0)));\nvec2 refractionCoords=vRefractionUVW.xy/vRefractionUVW.z;\nrefractionCoords.y=1.0-refractionCoords.y;\n#endif\n#ifdef SS_LODINREFRACTIONALPHA\nfloat refractionLOD=getLodFromAlphaG(vRefractionMicrosurfaceInfos.x,alphaG,NdotVUnclamped);\n#else\nfloat refractionLOD=getLodFromAlphaG(vRefractionMicrosurfaceInfos.x,alphaG);\n#endif\n#ifdef LODBASEDMICROSFURACE\n\nrefractionLOD=refractionLOD*vRefractionMicrosurfaceInfos.y+vRefractionMicrosurfaceInfos.z;\n#ifdef SS_LODINREFRACTIONALPHA\n\n\n\n\n\n\n\n\n\nfloat automaticRefractionLOD=UNPACK_LOD(sampleRefraction(refractionSampler,refractionCoords).a);\nfloat requestedRefractionLOD=max(automaticRefractionLOD,refractionLOD);\n#else\nfloat requestedRefractionLOD=refractionLOD;\n#endif\nenvironmentRefraction=sampleRefractionLod(refractionSampler,refractionCoords,requestedRefractionLOD);\n#else\nfloat lodRefractionNormalized=saturate(refractionLOD/log2(vRefractionMicrosurfaceInfos.x));\nfloat lodRefractionNormalizedDoubled=lodRefractionNormalized*2.0;\nvec4 environmentRefractionMid=sampleRefraction(refractionSampler,refractionCoords);\nif(lodRefractionNormalizedDoubled<1.0){\nenvironmentRefraction=mix(\nsampleRefraction(refractionSamplerHigh,refractionCoords),\nenvironmentRefractionMid,\nlodRefractionNormalizedDoubled\n);\n}else{\nenvironmentRefraction=mix(\nenvironmentRefractionMid,\nsampleRefraction(refractionSamplerLow,refractionCoords),\nlodRefractionNormalizedDoubled-1.0\n);\n}\n#endif\n#ifdef SS_RGBDREFRACTION\nenvironmentRefraction.rgb=fromRGBD(environmentRefraction);\n#endif\n#ifdef SS_GAMMAREFRACTION\nenvironmentRefraction.rgb=toLinearSpace(environmentRefraction.rgb);\n#endif\n\nenvironmentRefraction.rgb*=vRefractionInfos.x;\n#endif\n\n#ifdef REFLECTION\nvec4 environmentRadiance=vec4(0.,0.,0.,0.);\nvec3 environmentIrradiance=vec3(0.,0.,0.);\n#ifdef ANISOTROPIC\nvec3 reflectionVector=computeReflectionCoords(vec4(vPositionW,1.0),anisotropicNormal);\n#else\nvec3 reflectionVector=computeReflectionCoords(vec4(vPositionW,1.0),normalW);\n#endif\n#ifdef REFLECTIONMAP_OPPOSITEZ\nreflectionVector.z*=-1.0;\n#endif\n\n#ifdef REFLECTIONMAP_3D\nvec3 reflectionCoords=reflectionVector;\n#else\nvec2 reflectionCoords=reflectionVector.xy;\n#ifdef REFLECTIONMAP_PROJECTION\nreflectionCoords/=reflectionVector.z;\n#endif\nreflectionCoords.y=1.0-reflectionCoords.y;\n#endif\n#if defined(LODINREFLECTIONALPHA) && !defined(REFLECTIONMAP_SKYBOX)\nfloat reflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,alphaG,NdotVUnclamped);\n#else\nfloat reflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,alphaG);\n#endif\n#ifdef LODBASEDMICROSFURACE\n\nreflectionLOD=reflectionLOD*vReflectionMicrosurfaceInfos.y+vReflectionMicrosurfaceInfos.z;\n#ifdef LODINREFLECTIONALPHA\n\n\n\n\n\n\n\n\n\nfloat automaticReflectionLOD=UNPACK_LOD(sampleReflection(reflectionSampler,reflectionCoords).a);\nfloat requestedReflectionLOD=max(automaticReflectionLOD,reflectionLOD);\n#else\nfloat requestedReflectionLOD=reflectionLOD;\n#endif\nenvironmentRadiance=sampleReflectionLod(reflectionSampler,reflectionCoords,requestedReflectionLOD);\n#else\nfloat lodReflectionNormalized=saturate(reflectionLOD/log2(vReflectionMicrosurfaceInfos.x));\nfloat lodReflectionNormalizedDoubled=lodReflectionNormalized*2.0;\nvec4 environmentSpecularMid=sampleReflection(reflectionSampler,reflectionCoords);\nif(lodReflectionNormalizedDoubled<1.0){\nenvironmentRadiance=mix(\nsampleReflection(reflectionSamplerHigh,reflectionCoords),\nenvironmentSpecularMid,\nlodReflectionNormalizedDoubled\n);\n}else{\nenvironmentRadiance=mix(\nenvironmentSpecularMid,\nsampleReflection(reflectionSamplerLow,reflectionCoords),\nlodReflectionNormalizedDoubled-1.0\n);\n}\n#endif\n#ifdef RGBDREFLECTION\nenvironmentRadiance.rgb=fromRGBD(environmentRadiance);\n#endif\n#ifdef GAMMAREFLECTION\nenvironmentRadiance.rgb=toLinearSpace(environmentRadiance.rgb);\n#endif\n\n#ifdef USESPHERICALFROMREFLECTIONMAP\n#if defined(NORMAL) && defined(USESPHERICALINVERTEX)\nenvironmentIrradiance=vEnvironmentIrradiance;\n#else\n#ifdef ANISOTROPIC\nvec3 irradianceVector=vec3(reflectionMatrix*vec4(anisotropicNormal,0)).xyz;\n#else\nvec3 irradianceVector=vec3(reflectionMatrix*vec4(normalW,0)).xyz;\n#endif\n#ifdef REFLECTIONMAP_OPPOSITEZ\nirradianceVector.z*=-1.0;\n#endif\nenvironmentIrradiance=computeEnvironmentIrradiance(irradianceVector);\n#endif\n#endif\n\nenvironmentRadiance.rgb*=vReflectionInfos.x;\nenvironmentRadiance.rgb*=vReflectionColor.rgb;\nenvironmentIrradiance*=vReflectionColor.rgb;\n#endif\n\nfloat reflectance=max(max(surfaceReflectivityColor.r,surfaceReflectivityColor.g),surfaceReflectivityColor.b);\nfloat reflectance90=fresnelGrazingReflectance(reflectance);\nvec3 specularEnvironmentR0=surfaceReflectivityColor.rgb;\nvec3 specularEnvironmentR90=vec3(1.0,1.0,1.0)*reflectance90;\n\n#ifdef SHEEN\nfloat sheenIntensity=vSheenColor.a;\n#ifdef SHEEN_TEXTURE\nvec4 sheenMapData=texture2D(sheenSampler,vSheenUV+uvOffset)*vSheenInfos.y;\nsheenIntensity*=sheenMapData.a;\n#endif\n#ifdef SHEEN_LINKWITHALBEDO\nfloat sheenFactor=pow5(1.0-sheenIntensity);\nvec3 sheenColor=baseColor.rgb*(1.0-sheenFactor);\nfloat sheenRoughness=sheenIntensity;\n\nsurfaceAlbedo.rgb*=sheenFactor;\n#else\nvec3 sheenColor=vSheenColor.rgb;\n#ifdef SHEEN_TEXTURE\nsheenColor.rgb*=toLinearSpace(sheenMapData.rgb);\n#endif\nfloat sheenRoughness=roughness;\n\nsheenIntensity*=(1.-reflectance);\n\nsheenColor*=sheenIntensity;\n#endif\n\n#if defined(REFLECTION)\nfloat sheenAlphaG=convertRoughnessToAverageSlope(sheenRoughness);\n#ifdef SPECULARAA\n\nsheenAlphaG+=AARoughnessFactors.y;\n#endif\nvec4 environmentSheenRadiance=vec4(0.,0.,0.,0.);\n\n#if defined(LODINREFLECTIONALPHA) && !defined(REFLECTIONMAP_SKYBOX)\nfloat sheenReflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,sheenAlphaG,NdotVUnclamped);\n#else\nfloat sheenReflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,sheenAlphaG);\n#endif\n#ifdef LODBASEDMICROSFURACE\n\nsheenReflectionLOD=sheenReflectionLOD*vReflectionMicrosurfaceInfos.y+vReflectionMicrosurfaceInfos.z;\nenvironmentSheenRadiance=sampleReflectionLod(reflectionSampler,reflectionCoords,sheenReflectionLOD);\n#else\nfloat lodSheenReflectionNormalized=saturate(sheenReflectionLOD/log2(vReflectionMicrosurfaceInfos.x));\nfloat lodSheenReflectionNormalizedDoubled=lodSheenReflectionNormalized*2.0;\nvec4 environmentSheenMid=sampleReflection(reflectionSampler,reflectionCoords);\nif(lodSheenReflectionNormalizedDoubled<1.0){\nenvironmentSheenRadiance=mix(\nsampleReflection(reflectionSamplerHigh,reflectionCoords),\nenvironmentSheenMid,\nlodSheenReflectionNormalizedDoubled\n);\n}else{\nenvironmentSheenRadiance=mix(\nenvironmentSheenMid,\nsampleReflection(reflectionSamplerLow,reflectionCoords),\nlodSheenReflectionNormalizedDoubled-1.0\n);\n}\n#endif\n#ifdef RGBDREFLECTION\nenvironmentSheenRadiance.rgb=fromRGBD(environmentSheenRadiance);\n#endif\n#ifdef GAMMAREFLECTION\nenvironmentSheenRadiance.rgb=toLinearSpace(environmentSheenRadiance.rgb);\n#endif\n\nenvironmentSheenRadiance.rgb*=vReflectionInfos.x;\nenvironmentSheenRadiance.rgb*=vReflectionColor.rgb;\n#endif\n#endif\n\n#ifdef CLEARCOAT\n\nfloat clearCoatIntensity=vClearCoatParams.x;\nfloat clearCoatRoughness=vClearCoatParams.y;\n#ifdef CLEARCOAT_TEXTURE\nvec2 clearCoatMapData=texture2D(clearCoatSampler,vClearCoatUV+uvOffset).rg*vClearCoatInfos.y;\nclearCoatIntensity*=clearCoatMapData.x;\nclearCoatRoughness*=clearCoatMapData.y;\n#endif\n#ifdef CLEARCOAT_TINT\nvec3 clearCoatColor=vClearCoatTintParams.rgb;\nfloat clearCoatThickness=vClearCoatTintParams.a;\n#ifdef CLEARCOAT_TINT_TEXTURE\nvec4 clearCoatTintMapData=texture2D(clearCoatTintSampler,vClearCoatTintUV+uvOffset);\nclearCoatColor*=toLinearSpace(clearCoatTintMapData.rgb);\nclearCoatThickness*=clearCoatTintMapData.a;\n#endif\nclearCoatColor=computeColorAtDistanceInMedia(clearCoatColor,clearCoatColorAtDistance);\n#endif\n\n\n\n\nvec3 specularEnvironmentR0Updated=getR0RemappedForClearCoat(specularEnvironmentR0);\nspecularEnvironmentR0=mix(specularEnvironmentR0,specularEnvironmentR0Updated,clearCoatIntensity);\n#ifdef CLEARCOAT_BUMP\n#ifdef NORMALXYSCALE\nfloat clearCoatNormalScale=1.0;\n#else\nfloat clearCoatNormalScale=vClearCoatBumpInfos.y;\n#endif\n#if defined(TANGENT) && defined(NORMAL)\nmat3 TBNClearCoat=vTBN;\n#else\nmat3 TBNClearCoat=cotangent_frame(clearCoatNormalW*clearCoatNormalScale,vPositionW,vClearCoatBumpUV,vClearCoatTangentSpaceParams);\n#endif\n#ifdef OBJECTSPACE_NORMALMAP\nclearCoatNormalW=normalize(texture2D(clearCoatBumpSampler,vClearCoatBumpUV+uvOffset).xyz*2.0-1.0);\nclearCoatNormalW=normalize(mat3(normalMatrix)*clearCoatNormalW);\n#else\nclearCoatNormalW=perturbNormal(TBN,vClearCoatBumpUV+uvOffset,clearCoatBumpSampler,vClearCoatBumpInfos.y);\n#endif\n#endif\n#if defined(FORCENORMALFORWARD) && defined(NORMAL)\nclearCoatNormalW*=sign(dot(clearCoatNormalW,faceNormal));\n#endif\n#if defined(TWOSIDEDLIGHTING) && defined(NORMAL)\nclearCoatNormalW=gl_FrontFacing ? clearCoatNormalW : -clearCoatNormalW;\n#endif\n\nvec2 clearCoatAARoughnessFactors=getAARoughnessFactors(clearCoatNormalW.xyz);\n\nfloat clearCoatNdotVUnclamped=dot(clearCoatNormalW,viewDirectionW);\n\nfloat clearCoatNdotV=absEps(clearCoatNdotVUnclamped);\n\n#if defined(REFLECTION)\nfloat clearCoatAlphaG=convertRoughnessToAverageSlope(clearCoatRoughness);\n#ifdef SPECULARAA\n\nclearCoatAlphaG+=clearCoatAARoughnessFactors.y;\n#endif\nvec4 environmentClearCoatRadiance=vec4(0.,0.,0.,0.);\nvec3 clearCoatReflectionVector=computeReflectionCoords(vec4(vPositionW,1.0),clearCoatNormalW);\n#ifdef REFLECTIONMAP_OPPOSITEZ\nclearCoatReflectionVector.z*=-1.0;\n#endif\n\n#ifdef REFLECTIONMAP_3D\nvec3 clearCoatReflectionCoords=clearCoatReflectionVector;\n#else\nvec2 clearCoatReflectionCoords=clearCoatReflectionVector.xy;\n#ifdef REFLECTIONMAP_PROJECTION\nclearCoatReflectionCoords/=clearCoatReflectionVector.z;\n#endif\nclearCoatReflectionCoords.y=1.0-clearCoatReflectionCoords.y;\n#endif\n#if defined(LODINREFLECTIONALPHA) && !defined(REFLECTIONMAP_SKYBOX)\nfloat clearCoatReflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,clearCoatAlphaG,clearCoatNdotVUnclamped);\n#else\nfloat clearCoatReflectionLOD=getLodFromAlphaG(vReflectionMicrosurfaceInfos.x,clearCoatAlphaG);\n#endif\n#ifdef LODBASEDMICROSFURACE\n\nclearCoatReflectionLOD=clearCoatReflectionLOD*vReflectionMicrosurfaceInfos.y+vReflectionMicrosurfaceInfos.z;\nfloat requestedClearCoatReflectionLOD=clearCoatReflectionLOD;\nenvironmentClearCoatRadiance=sampleReflectionLod(reflectionSampler,clearCoatReflectionCoords,requestedClearCoatReflectionLOD);\n#else\nfloat lodClearCoatReflectionNormalized=saturate(clearCoatReflectionLOD/log2(vReflectionMicrosurfaceInfos.x));\nfloat lodClearCoatReflectionNormalizedDoubled=lodClearCoatReflectionNormalized*2.0;\nvec4 environmentClearCoatMid=sampleReflection(reflectionSampler,reflectionCoords);\nif(lodClearCoatReflectionNormalizedDoubled<1.0){\nenvironmentClearCoatRadiance=mix(\nsampleReflection(reflectionSamplerHigh,clearCoatReflectionCoords),\nenvironmentClearCoatMid,\nlodClearCoatReflectionNormalizedDoubled\n);\n}else{\nenvironmentClearCoatRadiance=mix(\nenvironmentClearCoatMid,\nsampleReflection(reflectionSamplerLow,clearCoatReflectionCoords),\nlodClearCoatReflectionNormalizedDoubled-1.0\n);\n}\n#endif\n#ifdef RGBDREFLECTION\nenvironmentClearCoatRadiance.rgb=fromRGBD(environmentClearCoatRadiance);\n#endif\n#ifdef GAMMAREFLECTION\nenvironmentClearCoatRadiance.rgb=toLinearSpace(environmentClearCoatRadiance.rgb);\n#endif\n#ifdef CLEARCOAT_TINT\n\nvec3 clearCoatVRefract=-refract(vPositionW,clearCoatNormalW,vClearCoatRefractionParams.y);\n\nfloat clearCoatNdotVRefract=absEps(dot(clearCoatNormalW,clearCoatVRefract));\nvec3 absorption=vec3(0.);\n#endif\n\nenvironmentClearCoatRadiance.rgb*=vReflectionInfos.x;\nenvironmentClearCoatRadiance.rgb*=vReflectionColor.rgb;\n#endif\n#endif\n\n#if defined(ENVIRONMENTBRDF)\n\nvec3 environmentBrdf=getBRDFLookup(NdotV,roughness,environmentBrdfSampler);\n#ifdef MS_BRDF_ENERGY_CONSERVATION\nvec3 energyConservationFactor=getEnergyConservationFactor(specularEnvironmentR0,environmentBrdf);\n#endif\n#endif\n\n#ifdef SUBSURFACE\n#ifdef SS_REFRACTION\nfloat refractionIntensity=vSubSurfaceIntensity.x;\n#ifdef SS_LINKREFRACTIONTOTRANSPARENCY\nrefractionIntensity*=(1.0-alpha);\n\nalpha=1.0;\n#endif\n#endif\n#ifdef SS_TRANSLUCENCY\nfloat translucencyIntensity=vSubSurfaceIntensity.y;\n#endif\n#ifdef SS_SCATTERING\nfloat scatteringIntensity=vSubSurfaceIntensity.z;\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nvec4 thicknessMap=texture2D(thicknessSampler,vThicknessUV+uvOffset);\nfloat thickness=thicknessMap.r*vThicknessParam.y+vThicknessParam.x;\n#ifdef SS_MASK_FROM_THICKNESS_TEXTURE\n#ifdef SS_REFRACTION\nrefractionIntensity*=thicknessMap.g;\n#endif\n#ifdef SS_TRANSLUCENCY\ntranslucencyIntensity*=thicknessMap.b;\n#endif\n#ifdef SS_SCATTERING\nscatteringIntensity*=thicknessMap.a;\n#endif\n#endif\n#else\nfloat thickness=vThicknessParam.y;\n#endif\n#ifdef SS_TRANSLUCENCY\nthickness=maxEps(thickness);\nvec3 transmittance=transmittanceBRDF_Burley(vTintColor.rgb,vDiffusionDistance,thickness);\ntransmittance*=translucencyIntensity;\n#endif\n#endif\n\n\nvec3 diffuseBase=vec3(0.,0.,0.);\n#ifdef SPECULARTERM\nvec3 specularBase=vec3(0.,0.,0.);\n#endif\n#ifdef CLEARCOAT\nvec3 clearCoatBase=vec3(0.,0.,0.);\n#endif\n#ifdef SHEEN\nvec3 sheenBase=vec3(0.,0.,0.);\n#endif\n#ifdef LIGHTMAP\nvec3 lightmapColor=texture2D(lightmapSampler,vLightmapUV+uvOffset).rgb;\n#ifdef GAMMALIGHTMAP\nlightmapColor=toLinearSpace(lightmapColor);\n#endif\nlightmapColor*=vLightmapInfos.y;\n#endif\n\npreLightingInfo preInfo;\nlightingInfo info;\nfloat shadow=1.;\n#include<lightFragment>[0..maxSimultaneousLights]\n\n#if defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\nvec3 specularEnvironmentReflectance=getReflectanceFromBRDFLookup(specularEnvironmentR0,environmentBrdf);\n#ifdef RADIANCEOCCLUSION\n#ifdef AMBIENTINGRAYSCALE\nfloat ambientMonochrome=ambientOcclusionColor.r;\n#else\nfloat ambientMonochrome=getLuminance(ambientOcclusionColor);\n#endif\nfloat seo=environmentRadianceOcclusion(ambientMonochrome,NdotVUnclamped);\nspecularEnvironmentReflectance*=seo;\n#endif\n#ifdef HORIZONOCCLUSION\n#ifdef BUMP\n#ifdef REFLECTIONMAP_3D\nfloat eho=environmentHorizonOcclusion(-viewDirectionW,normalW);\nspecularEnvironmentReflectance*=eho;\n#endif\n#endif\n#endif\n#else\n\nvec3 specularEnvironmentReflectance=getReflectanceFromAnalyticalBRDFLookup_Jones(NdotV,specularEnvironmentR0,specularEnvironmentR90,sqrt(microSurface));\n#endif\n\n#if defined(SHEEN) && defined(REFLECTION)\nvec3 sheenEnvironmentReflectance=getSheenReflectanceFromBRDFLookup(sheenColor,environmentBrdf);\n#ifdef RADIANCEOCCLUSION\nsheenEnvironmentReflectance*=seo;\n#endif\n#ifdef HORIZONOCCLUSION\n#ifdef BUMP\n#ifdef REFLECTIONMAP_3D\nsheenEnvironmentReflectance*=eho;\n#endif\n#endif\n#endif\n#endif\n\n#ifdef CLEARCOAT\n#if defined(ENVIRONMENTBRDF) && !defined(REFLECTIONMAP_SKYBOX)\n\nvec3 environmentClearCoatBrdf=getBRDFLookup(clearCoatNdotV,clearCoatRoughness,environmentBrdfSampler);\nvec3 clearCoatEnvironmentReflectance=getReflectanceFromBRDFLookup(vec3(vClearCoatRefractionParams.x),environmentClearCoatBrdf);\n#ifdef RADIANCEOCCLUSION\nfloat clearCoatSeo=environmentRadianceOcclusion(ambientMonochrome,clearCoatNdotVUnclamped);\nclearCoatEnvironmentReflectance*=clearCoatSeo;\n#endif\n#ifdef HORIZONOCCLUSION\n#ifdef BUMP\n#ifdef REFLECTIONMAP_3D\nfloat clearCoatEho=environmentHorizonOcclusion(-viewDirectionW,clearCoatNormalW);\nclearCoatEnvironmentReflectance*=clearCoatEho;\n#endif\n#endif\n#endif\n#else\n\nvec3 clearCoatEnvironmentReflectance=getReflectanceFromAnalyticalBRDFLookup_Jones(clearCoatNdotV,vec3(1.),vec3(1.),sqrt(1.-clearCoatRoughness));\n#endif\nclearCoatEnvironmentReflectance*=clearCoatIntensity;\n#ifdef CLEARCOAT_TINT\n\nabsorption=computeClearCoatAbsorption(clearCoatNdotVRefract,clearCoatNdotVRefract,clearCoatColor,clearCoatThickness,clearCoatIntensity);\n#ifdef REFLECTION\nenvironmentIrradiance*=absorption;\n#endif\n#ifdef SHEEN\nsheenEnvironmentReflectance*=absorption;\n#endif\nspecularEnvironmentReflectance*=absorption;\n#endif\n\nfloat fresnelIBLClearCoat=fresnelSchlickGGX(clearCoatNdotV,vClearCoatRefractionParams.x,CLEARCOATREFLECTANCE90);\nfresnelIBLClearCoat*=clearCoatIntensity;\nfloat conservationFactor=(1.-fresnelIBLClearCoat);\n#ifdef REFLECTION\nenvironmentIrradiance*=conservationFactor;\n#endif\n#ifdef SHEEN\nsheenEnvironmentReflectance*=(conservationFactor*conservationFactor);\n#endif\nspecularEnvironmentReflectance*=(conservationFactor*conservationFactor);\n#endif\n\n#ifdef SS_REFRACTION\nvec3 refractionTransmittance=vec3(refractionIntensity);\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nvec3 volumeAlbedo=computeColorAtDistanceInMedia(vTintColor.rgb,vTintColor.w);\n\n\n\n\n\nrefractionTransmittance*=cocaLambert(volumeAlbedo,thickness);\n#elif defined(SS_LINKREFRACTIONTOTRANSPARENCY)\n\nfloat maxChannel=max(max(surfaceAlbedo.r,surfaceAlbedo.g),surfaceAlbedo.b);\nvec3 volumeAlbedo=saturate(maxChannel*surfaceAlbedo);\n\nenvironmentRefraction.rgb*=volumeAlbedo;\n#else\n\nvec3 volumeAlbedo=computeColorAtDistanceInMedia(vTintColor.rgb,vTintColor.w);\nrefractionTransmittance*=cocaLambert(volumeAlbedo,vThicknessParam.y);\n#endif\n\nsurfaceAlbedo*=(1.-refractionIntensity);\n\nenvironmentIrradiance*=(1.-refractionIntensity);\n\nvec3 bounceSpecularEnvironmentReflectance=(2.0*specularEnvironmentReflectance)/(1.0+specularEnvironmentReflectance);\nspecularEnvironmentReflectance=mix(bounceSpecularEnvironmentReflectance,specularEnvironmentReflectance,refractionIntensity);\n\nrefractionTransmittance*=1.0-specularEnvironmentReflectance;\n#endif\n\n#if defined(REFLECTION) && defined(USESPHERICALFROMREFLECTIONMAP) && defined(SS_TRANSLUCENCY)\n#if defined(USESPHERICALINVERTEX)\nvec3 irradianceVector=vec3(reflectionMatrix*vec4(normalW,0)).xyz;\n#ifdef REFLECTIONMAP_OPPOSITEZ\nirradianceVector.z*=-1.0;\n#endif\n#endif\nvec3 refractionIrradiance=computeEnvironmentIrradiance(-irradianceVector);\nrefractionIrradiance*=transmittance;\n#endif\n\n\n\n#ifndef METALLICWORKFLOW\nsurfaceAlbedo.rgb=(1.-reflectance)*surfaceAlbedo.rgb;\n#endif\n\n#ifdef REFLECTION\nvec3 finalIrradiance=environmentIrradiance;\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(SS_TRANSLUCENCY)\nfinalIrradiance+=refractionIrradiance;\n#endif\nfinalIrradiance*=surfaceAlbedo.rgb;\n#endif\n\n#ifdef SPECULARTERM\nvec3 finalSpecular=specularBase;\nfinalSpecular=max(finalSpecular,0.0);\n\nvec3 finalSpecularScaled=finalSpecular*vLightingIntensity.x*vLightingIntensity.w;\n#if defined(ENVIRONMENTBRDF) && defined(MS_BRDF_ENERGY_CONSERVATION)\nfinalSpecularScaled*=energyConservationFactor;\n#endif\n#endif\n\n#ifdef REFLECTION\nvec3 finalRadiance=environmentRadiance.rgb;\nfinalRadiance*=specularEnvironmentReflectance;\n\nvec3 finalRadianceScaled=finalRadiance*vLightingIntensity.z;\n#if defined(ENVIRONMENTBRDF) && defined(MS_BRDF_ENERGY_CONSERVATION)\nfinalRadianceScaled*=energyConservationFactor;\n#endif\n#endif\n\n#ifdef SS_REFRACTION\nvec3 finalRefraction=environmentRefraction.rgb;\nfinalRefraction*=refractionTransmittance;\n#endif\n\n#ifdef CLEARCOAT\nvec3 finalClearCoat=clearCoatBase;\nfinalClearCoat=max(finalClearCoat,0.0);\n\nvec3 finalClearCoatScaled=finalClearCoat*vLightingIntensity.x*vLightingIntensity.w;\n#if defined(ENVIRONMENTBRDF) && defined(MS_BRDF_ENERGY_CONSERVATION)\nfinalClearCoatScaled*=energyConservationFactor;\n#endif\n\n#ifdef REFLECTION\nvec3 finalClearCoatRadiance=environmentClearCoatRadiance.rgb;\nfinalClearCoatRadiance*=clearCoatEnvironmentReflectance;\n\nvec3 finalClearCoatRadianceScaled=finalClearCoatRadiance*vLightingIntensity.z;\n#endif\n#ifdef SS_REFRACTION\nfinalRefraction*=(conservationFactor*conservationFactor);\n#ifdef CLEARCOAT_TINT\nfinalRefraction*=absorption;\n#endif\n#endif\n#endif\n\n#ifdef SHEEN\nvec3 finalSheen=sheenBase*sheenColor;\nfinalSheen=max(finalSheen,0.0);\nvec3 finalSheenScaled=finalSheen*vLightingIntensity.x*vLightingIntensity.w;\n\n\n\n\n\n#ifdef REFLECTION\nvec3 finalSheenRadiance=environmentSheenRadiance.rgb;\nfinalSheenRadiance*=sheenEnvironmentReflectance;\n\nvec3 finalSheenRadianceScaled=finalSheenRadiance*vLightingIntensity.z;\n#endif\n#endif\n\n#ifdef ALPHABLEND\nfloat luminanceOverAlpha=0.0;\n#if defined(REFLECTION) && defined(RADIANCEOVERALPHA)\nluminanceOverAlpha+=getLuminance(finalRadianceScaled);\n#if defined(CLEARCOAT)\nluminanceOverAlpha+=getLuminance(finalClearCoatRadianceScaled);\n#endif\n#endif\n#if defined(SPECULARTERM) && defined(SPECULAROVERALPHA)\nluminanceOverAlpha+=getLuminance(finalSpecularScaled);\n#endif\n#if defined(CLEARCOAT) && defined(CLEARCOATOVERALPHA)\nluminanceOverAlpha+=getLuminance(finalClearCoatScaled);\n#endif\n#if defined(RADIANCEOVERALPHA) || defined(SPECULAROVERALPHA)\nalpha=saturate(alpha+luminanceOverAlpha*luminanceOverAlpha);\n#endif\n#endif\n#endif\n\n\nvec3 finalDiffuse=diffuseBase;\nfinalDiffuse*=surfaceAlbedo.rgb;\nfinalDiffuse=max(finalDiffuse,0.0);\n\nvec3 finalAmbient=vAmbientColor;\nfinalAmbient*=surfaceAlbedo.rgb;\n\nvec3 finalEmissive=vEmissiveColor;\n#ifdef EMISSIVE\nvec3 emissiveColorTex=texture2D(emissiveSampler,vEmissiveUV+uvOffset).rgb;\nfinalEmissive*=toLinearSpace(emissiveColorTex.rgb);\nfinalEmissive*=vEmissiveInfos.y;\n#endif\n\n#ifdef AMBIENT\nvec3 ambientOcclusionForDirectDiffuse=mix(vec3(1.),ambientOcclusionColor,vAmbientInfos.w);\n#else\nvec3 ambientOcclusionForDirectDiffuse=ambientOcclusionColor;\n#endif\n\n\n\nvec4 finalColor=vec4(\nfinalAmbient*ambientOcclusionColor +\nfinalDiffuse*ambientOcclusionForDirectDiffuse*vLightingIntensity.x +\n#ifndef UNLIT\n#ifdef REFLECTION\nfinalIrradiance*ambientOcclusionColor*vLightingIntensity.z +\n#endif\n#ifdef SPECULARTERM\n\n\nfinalSpecularScaled +\n#endif\n#ifdef CLEARCOAT\n\n\nfinalClearCoatScaled +\n#endif\n#ifdef SHEEN\n\n\nfinalSheenScaled +\n#endif\n#ifdef REFLECTION\n\n\nfinalRadianceScaled +\n#ifdef CLEARCOAT\n\n\nfinalClearCoatRadianceScaled +\n#endif\n#ifdef SHEEN\n\n\nfinalSheenRadianceScaled +\n#endif\n#endif\n#ifdef SS_REFRACTION\nfinalRefraction*vLightingIntensity.z +\n#endif\n#endif\nfinalEmissive*vLightingIntensity.y,\nalpha);\n\n#ifdef LIGHTMAP\n#ifndef LIGHTMAPEXCLUDED\n#ifdef USELIGHTMAPASSHADOWMAP\nfinalColor.rgb*=lightmapColor;\n#else\nfinalColor.rgb+=lightmapColor;\n#endif\n#endif\n#endif\n#define CUSTOM_FRAGMENT_BEFORE_FOG\n\nfinalColor=max(finalColor,0.0);\n#include<logDepthFragment>\n#include<fogFragment>(color,finalColor)\n#ifdef IMAGEPROCESSINGPOSTPROCESS\n\n\nfinalColor.rgb=clamp(finalColor.rgb,0.,30.0);\n#else\n\nfinalColor=applyImageProcessing(finalColor);\n#endif\nfinalColor.a*=visibility;\n#ifdef PREMULTIPLYALPHA\n\nfinalColor.rgb*=finalColor.a;\n#endif\n#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR\ngl_FragColor=finalColor;\n#include<pbrDebug>\n}\n";
Effect.ShadersStore[name$e] = shader$e;

var name$f = 'pbrVertexDeclaration';
var shader$f = "uniform mat4 view;\nuniform mat4 viewProjection;\n#ifdef ALBEDO\nuniform mat4 albedoMatrix;\nuniform vec2 vAlbedoInfos;\n#endif\n#ifdef AMBIENT\nuniform mat4 ambientMatrix;\nuniform vec4 vAmbientInfos;\n#endif\n#ifdef OPACITY\nuniform mat4 opacityMatrix;\nuniform vec2 vOpacityInfos;\n#endif\n#ifdef EMISSIVE\nuniform vec2 vEmissiveInfos;\nuniform mat4 emissiveMatrix;\n#endif\n#ifdef LIGHTMAP\nuniform vec2 vLightmapInfos;\nuniform mat4 lightmapMatrix;\n#endif\n#ifdef REFLECTIVITY\nuniform vec3 vReflectivityInfos;\nuniform mat4 reflectivityMatrix;\n#endif\n#ifdef MICROSURFACEMAP\nuniform vec2 vMicroSurfaceSamplerInfos;\nuniform mat4 microSurfaceSamplerMatrix;\n#endif\n#ifdef BUMP\nuniform vec3 vBumpInfos;\nuniform mat4 bumpMatrix;\n#endif\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\n\n#ifdef REFLECTION\nuniform vec2 vReflectionInfos;\nuniform mat4 reflectionMatrix;\n#endif\n\n#ifdef CLEARCOAT\n#ifdef CLEARCOAT_TEXTURE\nuniform vec2 vClearCoatInfos;\nuniform mat4 clearCoatMatrix;\n#endif\n#ifdef CLEARCOAT_BUMP\nuniform vec2 vClearCoatBumpInfos;\nuniform mat4 clearCoatBumpMatrix;\n#endif\n#ifdef CLEARCOAT_TINT_TEXTURE\nuniform vec2 vClearCoatTintInfos;\nuniform mat4 clearCoatTintMatrix;\n#endif\n#endif\n\n#ifdef ANISOTROPIC\n#ifdef ANISOTROPIC_TEXTURE\nuniform vec2 vAnisotropyInfos;\nuniform mat4 anisotropyMatrix;\n#endif\n#endif\n\n#ifdef SHEEN\n#ifdef SHEEN_TEXTURE\nuniform vec2 vSheenInfos;\nuniform mat4 sheenMatrix;\n#endif\n#endif\n\n#ifdef SUBSURFACE\n#ifdef SS_REFRACTION\nuniform vec4 vRefractionInfos;\nuniform mat4 refractionMatrix;\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nuniform vec2 vThicknessInfos;\nuniform mat4 thicknessMatrix;;\n#endif\n#endif\n";
Effect.IncludesShadersStore[name$f] = shader$f;

var name$g = 'pbrVertexShader';
var shader$g = "precision highp float;\n#include<__decl__pbrVertex>\n#define CUSTOM_VERTEX_BEGIN\n\nattribute vec3 position;\n#ifdef NORMAL\nattribute vec3 normal;\n#endif\n#ifdef TANGENT\nattribute vec4 tangent;\n#endif\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#ifdef MAINUV1\nvarying vec2 vMainUV1;\n#endif\n#ifdef MAINUV2\nvarying vec2 vMainUV2;\n#endif\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\n#include<helperFunctions>\n#include<bonesDeclaration>\n\n#include<instancesDeclaration>\n#if defined(ALBEDO) && ALBEDODIRECTUV == 0\nvarying vec2 vAlbedoUV;\n#endif\n#if defined(AMBIENT) && AMBIENTDIRECTUV == 0\nvarying vec2 vAmbientUV;\n#endif\n#if defined(OPACITY) && OPACITYDIRECTUV == 0\nvarying vec2 vOpacityUV;\n#endif\n#if defined(EMISSIVE) && EMISSIVEDIRECTUV == 0\nvarying vec2 vEmissiveUV;\n#endif\n#if defined(LIGHTMAP) && LIGHTMAPDIRECTUV == 0\nvarying vec2 vLightmapUV;\n#endif\n#if defined(REFLECTIVITY) && REFLECTIVITYDIRECTUV == 0\nvarying vec2 vReflectivityUV;\n#endif\n#if defined(MICROSURFACEMAP) && MICROSURFACEMAPDIRECTUV == 0\nvarying vec2 vMicroSurfaceSamplerUV;\n#endif\n#if defined(BUMP) && BUMPDIRECTUV == 0\nvarying vec2 vBumpUV;\n#endif\n#ifdef CLEARCOAT\n#if defined(CLEARCOAT_TEXTURE) && CLEARCOAT_TEXTUREDIRECTUV == 0\nvarying vec2 vClearCoatUV;\n#endif\n#if defined(CLEARCOAT_BUMP) && CLEARCOAT_BUMPDIRECTUV == 0\nvarying vec2 vClearCoatBumpUV;\n#endif\n#if defined(CLEARCOAT_TINT_TEXTURE) && CLEARCOAT_TINT_TEXTUREDIRECTUV == 0\nvarying vec2 vClearCoatTintUV;\n#endif\n#endif\n#ifdef SHEEN\n#if defined(SHEEN_TEXTURE) && SHEEN_TEXTUREDIRECTUV == 0\nvarying vec2 vSheenUV;\n#endif\n#endif\n#ifdef ANISOTROPIC\n#if defined(ANISOTROPIC_TEXTURE) && ANISOTROPIC_TEXTUREDIRECTUV == 0\nvarying vec2 vAnisotropyUV;\n#endif\n#endif\n#ifdef SUBSURFACE\n#if defined(SS_THICKNESSANDMASK_TEXTURE) && SS_THICKNESSANDMASK_TEXTUREDIRECTUV == 0\nvarying vec2 vThicknessUV;\n#endif\n#endif\n\nvarying vec3 vPositionW;\n#if DEBUGMODE>0\nvarying vec4 vClipSpacePosition;\n#endif\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\nvarying vec3 vEnvironmentIrradiance;\n#include<harmonicsFunctions>\n#endif\n#endif\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<bumpVertexDeclaration>\n#include<clipPlaneVertexDeclaration>\n#include<fogVertexDeclaration>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#include<morphTargetsVertexGlobalDeclaration>\n#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]\n#ifdef REFLECTIONMAP_SKYBOX\nvarying vec3 vPositionUVW;\n#endif\n#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\nvarying vec3 vDirectionW;\n#endif\n#include<logDepthDeclaration>\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvec3 positionUpdated=position;\n#ifdef NORMAL\nvec3 normalUpdated=normal;\n#endif\n#ifdef TANGENT\nvec4 tangentUpdated=tangent;\n#endif\n#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]\n#ifdef REFLECTIONMAP_SKYBOX\n#ifdef REFLECTIONMAP_SKYBOX_TRANSFORMED\nvPositionUVW=(reflectionMatrix*vec4(positionUpdated,1.0)).xyz;\n#else\nvPositionUVW=positionUpdated;\n#endif\n#endif\n#define CUSTOM_VERTEX_UPDATE_POSITION\n#define CUSTOM_VERTEX_UPDATE_NORMAL\n#include<instancesVertex>\n#include<bonesVertex>\n#ifdef MULTIVIEW\nif (gl_ViewID_OVR == 0u) {\ngl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);\n} else {\ngl_Position=viewProjectionR*finalWorld*vec4(positionUpdated,1.0);\n}\n#else\ngl_Position=viewProjection*finalWorld*vec4(positionUpdated,1.0);\n#endif\n#if DEBUGMODE>0\nvClipSpacePosition=gl_Position;\n#endif\nvec4 worldPos=finalWorld*vec4(positionUpdated,1.0);\nvPositionW=vec3(worldPos);\n#ifdef NORMAL\nmat3 normalWorld=mat3(finalWorld);\n#ifdef NONUNIFORMSCALING\nnormalWorld=transposeMat3(inverseMat3(normalWorld));\n#endif\nvNormalW=normalize(normalWorld*normalUpdated);\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\nvec3 reflectionVector=vec3(reflectionMatrix*vec4(vNormalW,0)).xyz;\n#ifdef REFLECTIONMAP_OPPOSITEZ\nreflectionVector.z*=-1.0;\n#endif\nvEnvironmentIrradiance=computeEnvironmentIrradiance(reflectionVector);\n#endif\n#endif\n#if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\nvDirectionW=normalize(vec3(finalWorld*vec4(positionUpdated,0.0)));\n#endif\n\n#ifndef UV1\nvec2 uv=vec2(0.,0.);\n#endif\n#ifndef UV2\nvec2 uv2=vec2(0.,0.);\n#endif\n#ifdef MAINUV1\nvMainUV1=uv;\n#endif\n#ifdef MAINUV2\nvMainUV2=uv2;\n#endif\n#if defined(ALBEDO) && ALBEDODIRECTUV == 0\nif (vAlbedoInfos.x == 0.)\n{\nvAlbedoUV=vec2(albedoMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvAlbedoUV=vec2(albedoMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(AMBIENT) && AMBIENTDIRECTUV == 0\nif (vAmbientInfos.x == 0.)\n{\nvAmbientUV=vec2(ambientMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvAmbientUV=vec2(ambientMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(OPACITY) && OPACITYDIRECTUV == 0\nif (vOpacityInfos.x == 0.)\n{\nvOpacityUV=vec2(opacityMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvOpacityUV=vec2(opacityMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(EMISSIVE) && EMISSIVEDIRECTUV == 0\nif (vEmissiveInfos.x == 0.)\n{\nvEmissiveUV=vec2(emissiveMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvEmissiveUV=vec2(emissiveMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(LIGHTMAP) && LIGHTMAPDIRECTUV == 0\nif (vLightmapInfos.x == 0.)\n{\nvLightmapUV=vec2(lightmapMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvLightmapUV=vec2(lightmapMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(REFLECTIVITY) && REFLECTIVITYDIRECTUV == 0\nif (vReflectivityInfos.x == 0.)\n{\nvReflectivityUV=vec2(reflectivityMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvReflectivityUV=vec2(reflectivityMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(MICROSURFACEMAP) && MICROSURFACEMAPDIRECTUV == 0\nif (vMicroSurfaceSamplerInfos.x == 0.)\n{\nvMicroSurfaceSamplerUV=vec2(microSurfaceSamplerMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvMicroSurfaceSamplerUV=vec2(microSurfaceSamplerMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(BUMP) && BUMPDIRECTUV == 0\nif (vBumpInfos.x == 0.)\n{\nvBumpUV=vec2(bumpMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvBumpUV=vec2(bumpMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#ifdef CLEARCOAT\n#if defined(CLEARCOAT_TEXTURE) && CLEARCOAT_TEXTUREDIRECTUV == 0\nif (vClearCoatInfos.x == 0.)\n{\nvClearCoatUV=vec2(clearCoatMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvClearCoatUV=vec2(clearCoatMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(CLEARCOAT_BUMP) && CLEARCOAT_BUMPDIRECTUV == 0\nif (vClearCoatBumpInfos.x == 0.)\n{\nvClearCoatBumpUV=vec2(clearCoatBumpMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvClearCoatBumpUV=vec2(clearCoatBumpMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(CLEARCOAT_TINT_TEXTURE) && CLEARCOAT_TINT_TEXTUREDIRECTUV == 0\nif (vClearCoatTintInfos.x == 0.)\n{\nvClearCoatTintUV=vec2(clearCoatTintMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvClearCoatTintUV=vec2(clearCoatTintMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#endif\n#ifdef SHEEN\n#if defined(SHEEN_TEXTURE) && SHEEN_TEXTUREDIRECTUV == 0\nif (vSheenInfos.x == 0.)\n{\nvSheenUV=vec2(sheenMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvSheenUV=vec2(sheenMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#endif\n#ifdef ANISOTROPIC\n#if defined(ANISOTROPIC_TEXTURE) && ANISOTROPIC_TEXTUREDIRECTUV == 0\nif (vAnisotropyInfos.x == 0.)\n{\nvAnisotropyUV=vec2(anisotropyMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvAnisotropyUV=vec2(anisotropyMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#endif\n#ifdef SUBSURFACE\n#if defined(SS_THICKNESSANDMASK_TEXTURE) && SS_THICKNESSANDMASK_TEXTUREDIRECTUV == 0\nif (vThicknessInfos.x == 0.)\n{\nvThicknessUV=vec2(thicknessMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvThicknessUV=vec2(thicknessMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#endif\n\n#include<bumpVertex>\n\n#include<clipPlaneVertex>\n\n#include<fogVertex>\n\n#include<shadowsVertex>[0..maxSimultaneousLights]\n\n#ifdef VERTEXCOLOR\nvColor=color;\n#endif\n\n#ifdef POINTSIZE\ngl_PointSize=pointSize;\n#endif\n\n#include<logDepthVertex>\n#define CUSTOM_VERTEX_MAIN_END\n}";
Effect.ShadersStore[name$g] = shader$g;

/**
 * Manages the defines for the PBR Material.
 * @hidden
 */
var PBRMaterialDefines = /** @class */ (function (_super) {
    __extends(PBRMaterialDefines, _super);
    /**
     * Initializes the PBR Material defines.
     */
    function PBRMaterialDefines() {
        var _this = _super.call(this) || this;
        _this.PBR = true;
        _this.MAINUV1 = false;
        _this.MAINUV2 = false;
        _this.UV1 = false;
        _this.UV2 = false;
        _this.ALBEDO = false;
        _this.ALBEDODIRECTUV = 0;
        _this.VERTEXCOLOR = false;
        _this.AMBIENT = false;
        _this.AMBIENTDIRECTUV = 0;
        _this.AMBIENTINGRAYSCALE = false;
        _this.OPACITY = false;
        _this.VERTEXALPHA = false;
        _this.OPACITYDIRECTUV = 0;
        _this.OPACITYRGB = false;
        _this.ALPHATEST = false;
        _this.DEPTHPREPASS = false;
        _this.ALPHABLEND = false;
        _this.ALPHAFROMALBEDO = false;
        _this.ALPHATESTVALUE = "0.5";
        _this.SPECULAROVERALPHA = false;
        _this.RADIANCEOVERALPHA = false;
        _this.ALPHAFRESNEL = false;
        _this.LINEARALPHAFRESNEL = false;
        _this.PREMULTIPLYALPHA = false;
        _this.EMISSIVE = false;
        _this.EMISSIVEDIRECTUV = 0;
        _this.REFLECTIVITY = false;
        _this.REFLECTIVITYDIRECTUV = 0;
        _this.SPECULARTERM = false;
        _this.MICROSURFACEFROMREFLECTIVITYMAP = false;
        _this.MICROSURFACEAUTOMATIC = false;
        _this.LODBASEDMICROSFURACE = false;
        _this.MICROSURFACEMAP = false;
        _this.MICROSURFACEMAPDIRECTUV = 0;
        _this.METALLICWORKFLOW = false;
        _this.ROUGHNESSSTOREINMETALMAPALPHA = false;
        _this.ROUGHNESSSTOREINMETALMAPGREEN = false;
        _this.METALLNESSSTOREINMETALMAPBLUE = false;
        _this.AOSTOREINMETALMAPRED = false;
        _this.ENVIRONMENTBRDF = false;
        _this.ENVIRONMENTBRDF_RGBD = false;
        _this.NORMAL = false;
        _this.TANGENT = false;
        _this.BUMP = false;
        _this.BUMPDIRECTUV = 0;
        _this.OBJECTSPACE_NORMALMAP = false;
        _this.PARALLAX = false;
        _this.PARALLAXOCCLUSION = false;
        _this.NORMALXYSCALE = true;
        _this.LIGHTMAP = false;
        _this.LIGHTMAPDIRECTUV = 0;
        _this.USELIGHTMAPASSHADOWMAP = false;
        _this.GAMMALIGHTMAP = false;
        _this.REFLECTION = false;
        _this.REFLECTIONMAP_3D = false;
        _this.REFLECTIONMAP_SPHERICAL = false;
        _this.REFLECTIONMAP_PLANAR = false;
        _this.REFLECTIONMAP_CUBIC = false;
        _this.USE_LOCAL_REFLECTIONMAP_CUBIC = false;
        _this.REFLECTIONMAP_PROJECTION = false;
        _this.REFLECTIONMAP_SKYBOX = false;
        _this.REFLECTIONMAP_SKYBOX_TRANSFORMED = false;
        _this.REFLECTIONMAP_EXPLICIT = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
        _this.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
        _this.INVERTCUBICMAP = false;
        _this.USESPHERICALFROMREFLECTIONMAP = false;
        _this.SPHERICAL_HARMONICS = false;
        _this.USESPHERICALINVERTEX = false;
        _this.REFLECTIONMAP_OPPOSITEZ = false;
        _this.LODINREFLECTIONALPHA = false;
        _this.GAMMAREFLECTION = false;
        _this.RGBDREFLECTION = false;
        _this.RADIANCEOCCLUSION = false;
        _this.HORIZONOCCLUSION = false;
        _this.INSTANCES = false;
        _this.NUM_BONE_INFLUENCERS = 0;
        _this.BonesPerMesh = 0;
        _this.BONETEXTURE = false;
        _this.NONUNIFORMSCALING = false;
        _this.MORPHTARGETS = false;
        _this.MORPHTARGETS_NORMAL = false;
        _this.MORPHTARGETS_TANGENT = false;
        _this.NUM_MORPH_INFLUENCERS = 0;
        _this.IMAGEPROCESSING = false;
        _this.VIGNETTE = false;
        _this.VIGNETTEBLENDMODEMULTIPLY = false;
        _this.VIGNETTEBLENDMODEOPAQUE = false;
        _this.TONEMAPPING = false;
        _this.TONEMAPPING_ACES = false;
        _this.CONTRAST = false;
        _this.COLORCURVES = false;
        _this.COLORGRADING = false;
        _this.COLORGRADING3D = false;
        _this.SAMPLER3DGREENDEPTH = false;
        _this.SAMPLER3DBGRMAP = false;
        _this.IMAGEPROCESSINGPOSTPROCESS = false;
        _this.EXPOSURE = false;
        _this.MULTIVIEW = false;
        _this.USEPHYSICALLIGHTFALLOFF = false;
        _this.USEGLTFLIGHTFALLOFF = false;
        _this.TWOSIDEDLIGHTING = false;
        _this.SHADOWFLOAT = false;
        _this.CLIPPLANE = false;
        _this.CLIPPLANE2 = false;
        _this.CLIPPLANE3 = false;
        _this.CLIPPLANE4 = false;
        _this.POINTSIZE = false;
        _this.FOG = false;
        _this.LOGARITHMICDEPTH = false;
        _this.FORCENORMALFORWARD = false;
        _this.SPECULARAA = false;
        _this.CLEARCOAT = false;
        _this.CLEARCOAT_DEFAULTIOR = false;
        _this.CLEARCOAT_TEXTURE = false;
        _this.CLEARCOAT_TEXTUREDIRECTUV = 0;
        _this.CLEARCOAT_BUMP = false;
        _this.CLEARCOAT_BUMPDIRECTUV = 0;
        _this.CLEARCOAT_TINT = false;
        _this.CLEARCOAT_TINT_TEXTURE = false;
        _this.CLEARCOAT_TINT_TEXTUREDIRECTUV = 0;
        _this.ANISOTROPIC = false;
        _this.ANISOTROPIC_TEXTURE = false;
        _this.ANISOTROPIC_TEXTUREDIRECTUV = 0;
        _this.BRDF_V_HEIGHT_CORRELATED = false;
        _this.MS_BRDF_ENERGY_CONSERVATION = false;
        _this.SHEEN = false;
        _this.SHEEN_TEXTURE = false;
        _this.SHEEN_TEXTUREDIRECTUV = 0;
        _this.SHEEN_LINKWITHALBEDO = false;
        _this.SUBSURFACE = false;
        _this.SS_REFRACTION = false;
        _this.SS_TRANSLUCENCY = false;
        _this.SS_SCATERRING = false;
        _this.SS_THICKNESSANDMASK_TEXTURE = false;
        _this.SS_THICKNESSANDMASK_TEXTUREDIRECTUV = 0;
        _this.SS_REFRACTIONMAP_3D = false;
        _this.SS_REFRACTIONMAP_OPPOSITEZ = false;
        _this.SS_LODINREFRACTIONALPHA = false;
        _this.SS_GAMMAREFRACTION = false;
        _this.SS_RGBDREFRACTION = false;
        _this.SS_LINKREFRACTIONTOTRANSPARENCY = false;
        _this.SS_MASK_FROM_THICKNESS_TEXTURE = false;
        _this.UNLIT = false;
        _this.DEBUGMODE = 0;
        _this.rebuild();
        return _this;
    }
    /**
     * Resets the PBR Material defines.
     */
    PBRMaterialDefines.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.ALPHATESTVALUE = "0.5";
        this.PBR = true;
    };
    return PBRMaterialDefines;
}(MaterialDefines));
/**
 * The Physically based material base class of BJS.
 *
 * This offers the main features of a standard PBR material.
 * For more information, please refer to the documentation :
 * http://doc.babylonjs.com/extensions/Physically_Based_Rendering
 */
var PBRBaseMaterial = /** @class */ (function (_super) {
    __extends(PBRBaseMaterial, _super);
    /**
     * Instantiates a new PBRMaterial instance.
     *
     * @param name The material name
     * @param scene The scene the material will be use in.
     */
    function PBRBaseMaterial(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        /**
         * Intensity of the direct lights e.g. the four lights available in your scene.
         * This impacts both the direct diffuse and specular highlights.
         */
        _this._directIntensity = 1.0;
        /**
         * Intensity of the emissive part of the material.
         * This helps controlling the emissive effect without modifying the emissive color.
         */
        _this._emissiveIntensity = 1.0;
        /**
         * Intensity of the environment e.g. how much the environment will light the object
         * either through harmonics for rough material or through the refelction for shiny ones.
         */
        _this._environmentIntensity = 1.0;
        /**
         * This is a special control allowing the reduction of the specular highlights coming from the
         * four lights of the scene. Those highlights may not be needed in full environment lighting.
         */
        _this._specularIntensity = 1.0;
        /**
         * This stores the direct, emissive, environment, and specular light intensities into a Vector4.
         */
        _this._lightingInfos = new Vector4(_this._directIntensity, _this._emissiveIntensity, _this._environmentIntensity, _this._specularIntensity);
        /**
         * Debug Control allowing disabling the bump map on this material.
         */
        _this._disableBumpMap = false;
        /**
         * AKA Diffuse Texture in standard nomenclature.
         */
        _this._albedoTexture = null;
        /**
         * AKA Occlusion Texture in other nomenclature.
         */
        _this._ambientTexture = null;
        /**
         * AKA Occlusion Texture Intensity in other nomenclature.
         */
        _this._ambientTextureStrength = 1.0;
        /**
         * Defines how much the AO map is occluding the analytical lights (point spot...).
         * 1 means it completely occludes it
         * 0 mean it has no impact
         */
        _this._ambientTextureImpactOnAnalyticalLights = PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS;
        /**
         * Stores the alpha values in a texture.
         */
        _this._opacityTexture = null;
        /**
         * Stores the reflection values in a texture.
         */
        _this._reflectionTexture = null;
        /**
         * Stores the emissive values in a texture.
         */
        _this._emissiveTexture = null;
        /**
         * AKA Specular texture in other nomenclature.
         */
        _this._reflectivityTexture = null;
        /**
         * Used to switch from specular/glossiness to metallic/roughness workflow.
         */
        _this._metallicTexture = null;
        /**
         * Specifies the metallic scalar of the metallic/roughness workflow.
         * Can also be used to scale the metalness values of the metallic texture.
         */
        _this._metallic = null;
        /**
         * Specifies the roughness scalar of the metallic/roughness workflow.
         * Can also be used to scale the roughness values of the metallic texture.
         */
        _this._roughness = null;
        /**
         * Used to enable roughness/glossiness fetch from a separate channel depending on the current mode.
         * Gray Scale represents roughness in metallic mode and glossiness in specular mode.
         */
        _this._microSurfaceTexture = null;
        /**
         * Stores surface normal data used to displace a mesh in a texture.
         */
        _this._bumpTexture = null;
        /**
         * Stores the pre-calculated light information of a mesh in a texture.
         */
        _this._lightmapTexture = null;
        /**
         * The color of a material in ambient lighting.
         */
        _this._ambientColor = new Color3(0, 0, 0);
        /**
         * AKA Diffuse Color in other nomenclature.
         */
        _this._albedoColor = new Color3(1, 1, 1);
        /**
         * AKA Specular Color in other nomenclature.
         */
        _this._reflectivityColor = new Color3(1, 1, 1);
        /**
         * The color applied when light is reflected from a material.
         */
        _this._reflectionColor = new Color3(1, 1, 1);
        /**
         * The color applied when light is emitted from a material.
         */
        _this._emissiveColor = new Color3(0, 0, 0);
        /**
         * AKA Glossiness in other nomenclature.
         */
        _this._microSurface = 0.9;
        /**
         * Specifies that the material will use the light map as a show map.
         */
        _this._useLightmapAsShadowmap = false;
        /**
         * This parameters will enable/disable Horizon occlusion to prevent normal maps to look shiny when the normal
         * makes the reflect vector face the model (under horizon).
         */
        _this._useHorizonOcclusion = true;
        /**
         * This parameters will enable/disable radiance occlusion by preventing the radiance to lit
         * too much the area relying on ambient texture to define their ambient occlusion.
         */
        _this._useRadianceOcclusion = true;
        /**
         * Specifies that the alpha is coming form the albedo channel alpha channel for alpha blending.
         */
        _this._useAlphaFromAlbedoTexture = false;
        /**
         * Specifies that the material will keeps the specular highlights over a transparent surface (only the most limunous ones).
         * A car glass is a good exemple of that. When sun reflects on it you can not see what is behind.
         */
        _this._useSpecularOverAlpha = true;
        /**
         * Specifies if the reflectivity texture contains the glossiness information in its alpha channel.
         */
        _this._useMicroSurfaceFromReflectivityMapAlpha = false;
        /**
         * Specifies if the metallic texture contains the roughness information in its alpha channel.
         */
        _this._useRoughnessFromMetallicTextureAlpha = true;
        /**
         * Specifies if the metallic texture contains the roughness information in its green channel.
         */
        _this._useRoughnessFromMetallicTextureGreen = false;
        /**
         * Specifies if the metallic texture contains the metallness information in its blue channel.
         */
        _this._useMetallnessFromMetallicTextureBlue = false;
        /**
         * Specifies if the metallic texture contains the ambient occlusion information in its red channel.
         */
        _this._useAmbientOcclusionFromMetallicTextureRed = false;
        /**
         * Specifies if the ambient texture contains the ambient occlusion information in its red channel only.
         */
        _this._useAmbientInGrayScale = false;
        /**
         * In case the reflectivity map does not contain the microsurface information in its alpha channel,
         * The material will try to infer what glossiness each pixel should be.
         */
        _this._useAutoMicroSurfaceFromReflectivityMap = false;
        /**
         * Defines the  falloff type used in this material.
         * It by default is Physical.
         */
        _this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL;
        /**
         * Specifies that the material will keeps the reflection highlights over a transparent surface (only the most limunous ones).
         * A car glass is a good exemple of that. When the street lights reflects on it you can not see what is behind.
         */
        _this._useRadianceOverAlpha = true;
        /**
         * Allows using an object space normal map (instead of tangent space).
         */
        _this._useObjectSpaceNormalMap = false;
        /**
         * Allows using the bump map in parallax mode.
         */
        _this._useParallax = false;
        /**
         * Allows using the bump map in parallax occlusion mode.
         */
        _this._useParallaxOcclusion = false;
        /**
         * Controls the scale bias of the parallax mode.
         */
        _this._parallaxScaleBias = 0.05;
        /**
         * If sets to true, disables all the lights affecting the material.
         */
        _this._disableLighting = false;
        /**
         * Number of Simultaneous lights allowed on the material.
         */
        _this._maxSimultaneousLights = 4;
        /**
         * If sets to true, x component of normal map value will be inverted (x = 1.0 - x).
         */
        _this._invertNormalMapX = false;
        /**
         * If sets to true, y component of normal map value will be inverted (y = 1.0 - y).
         */
        _this._invertNormalMapY = false;
        /**
         * If sets to true and backfaceCulling is false, normals will be flipped on the backside.
         */
        _this._twoSidedLighting = false;
        /**
         * Defines the alpha limits in alpha test mode.
         */
        _this._alphaCutOff = 0.4;
        /**
         * Enforces alpha test in opaque or blend mode in order to improve the performances of some situations.
         */
        _this._forceAlphaTest = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha is converted to gamma to compute the fresnel)
         */
        _this._useAlphaFresnel = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha stays linear to compute the fresnel)
         */
        _this._useLinearAlphaFresnel = false;
        /**
         * The transparency mode of the material.
         */
        _this._transparencyMode = null;
        /**
         * Specifies the environment BRDF texture used to comput the scale and offset roughness values
         * from cos thetav and roughness:
         * http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
         */
        _this._environmentBRDFTexture = null;
        /**
         * Force the shader to compute irradiance in the fragment shader in order to take bump in account.
         */
        _this._forceIrradianceInFragment = false;
        /**
         * Force normal to face away from face.
         */
        _this._forceNormalForward = false;
        /**
         * Enables specular anti aliasing in the PBR shader.
         * It will both interacts on the Geometry for analytical and IBL lighting.
         * It also prefilter the roughness map based on the bump values.
         */
        _this._enableSpecularAntiAliasing = false;
        /**
         * Keep track of the image processing observer to allow dispose and replace.
         */
        _this._imageProcessingObserver = null;
        /**
         * Stores the available render targets.
         */
        _this._renderTargets = new SmartArray(16);
        /**
         * Sets the global ambient color for the material used in lighting calculations.
         */
        _this._globalAmbientColor = new Color3(0, 0, 0);
        /**
         * Enables the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        _this._useLogarithmicDepth = false;
        /**
         * If set to true, no lighting calculations will be applied.
         */
        _this._unlit = false;
        _this._debugMode = 0;
        /**
         * @hidden
         * This is reserved for the inspector.
         * Defines the material debug mode.
         * It helps seeing only some components of the material while troubleshooting.
         */
        _this.debugMode = 0;
        /**
         * @hidden
         * This is reserved for the inspector.
         * Specify from where on screen the debug mode should start.
         * The value goes from -1 (full screen) to 1 (not visible)
         * It helps with side by side comparison against the final render
         * This defaults to -1
         */
        _this.debugLimit = -1;
        /**
         * @hidden
         * This is reserved for the inspector.
         * As the default viewing range might not be enough (if the ambient is really small for instance)
         * You can use the factor to better multiply the final value.
         */
        _this.debugFactor = 1;
        /**
         * Defines the clear coat layer parameters for the material.
         */
        _this.clearCoat = new PBRClearCoatConfiguration(_this._markAllSubMeshesAsTexturesDirty.bind(_this));
        /**
         * Defines the anisotropic parameters for the material.
         */
        _this.anisotropy = new PBRAnisotropicConfiguration(_this._markAllSubMeshesAsTexturesDirty.bind(_this));
        /**
         * Defines the BRDF parameters for the material.
         */
        _this.brdf = new PBRBRDFConfiguration(_this._markAllSubMeshesAsMiscDirty.bind(_this));
        /**
         * Defines the Sheen parameters for the material.
         */
        _this.sheen = new PBRSheenConfiguration(_this._markAllSubMeshesAsTexturesDirty.bind(_this));
        /**
         * Defines the SubSurface parameters for the material.
         */
        _this.subSurface = new PBRSubSurfaceConfiguration(_this._markAllSubMeshesAsTexturesDirty.bind(_this));
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        _this.getRenderTargetTextures = function () {
            _this._renderTargets.reset();
            if (MaterialFlags.ReflectionTextureEnabled && _this._reflectionTexture && _this._reflectionTexture.isRenderTarget) {
                _this._renderTargets.push(_this._reflectionTexture);
            }
            _this.subSurface.fillRenderTargetTextures(_this._renderTargets);
            return _this._renderTargets;
        };
        _this._environmentBRDFTexture = BRDFTextureTools.GetEnvironmentBRDFTexture(scene);
        return _this;
    }
    /**
     * Attaches a new image processing configuration to the PBR Material.
     * @param configuration
     */
    PBRBaseMaterial.prototype._attachImageProcessingConfiguration = function (configuration) {
        var _this = this;
        if (configuration === this._imageProcessingConfiguration) {
            return;
        }
        // Detaches observer.
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        // Pick the scene configuration if needed.
        if (!configuration) {
            this._imageProcessingConfiguration = this.getScene().imageProcessingConfiguration;
        }
        else {
            this._imageProcessingConfiguration = configuration;
        }
        // Attaches observer.
        if (this._imageProcessingConfiguration) {
            this._imageProcessingObserver = this._imageProcessingConfiguration.onUpdateParameters.add(function () {
                _this._markAllSubMeshesAsImageProcessingDirty();
            });
        }
    };
    Object.defineProperty(PBRBaseMaterial.prototype, "hasRenderTargetTextures", {
        /**
         * Gets a boolean indicating that current material needs to register RTT
         */
        get: function () {
            if (MaterialFlags.ReflectionTextureEnabled && this._reflectionTexture && this._reflectionTexture.isRenderTarget) {
                return true;
            }
            return this.subSurface.hasRenderTargetTextures();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the name of the material class.
     */
    PBRBaseMaterial.prototype.getClassName = function () {
        return "PBRBaseMaterial";
    };
    Object.defineProperty(PBRBaseMaterial.prototype, "useLogarithmicDepth", {
        /**
         * Enabled the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        get: function () {
            return this._useLogarithmicDepth;
        },
        /**
         * Enabled the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        set: function (value) {
            this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "transparencyMode", {
        /**
         * Gets the current transparency mode.
         */
        get: function () {
            return this._transparencyMode;
        },
        /**
         * Sets the transparency mode of the material.
         *
         * | Value | Type                                | Description |
         * | ----- | ----------------------------------- | ----------- |
         * | 0     | OPAQUE                              |             |
         * | 1     | ALPHATEST                           |             |
         * | 2     | ALPHABLEND                          |             |
         * | 3     | ALPHATESTANDBLEND                   |             |
         *
         */
        set: function (value) {
            if (this._transparencyMode === value) {
                return;
            }
            this._transparencyMode = value;
            this._forceAlphaTest = (value === PBRBaseMaterial.PBRMATERIAL_ALPHATESTANDBLEND);
            this._markAllSubMeshesAsTexturesAndMiscDirty();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "_disableAlphaBlending", {
        /**
         * Returns true if alpha blending should be disabled.
         */
        get: function () {
            return (this.subSurface.disableAlphaBlending ||
                this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_OPAQUE ||
                this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_ALPHATEST);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Specifies whether or not this material should be rendered in alpha blend mode.
     */
    PBRBaseMaterial.prototype.needAlphaBlending = function () {
        if (this._disableAlphaBlending) {
            return false;
        }
        return (this.alpha < 1.0) || (this._opacityTexture != null) || this._shouldUseAlphaFromAlbedoTexture();
    };
    /**
     * Specifies if the mesh will require alpha blending.
     * @param mesh - BJS mesh.
     */
    PBRBaseMaterial.prototype.needAlphaBlendingForMesh = function (mesh) {
        if (this._disableAlphaBlending && mesh.visibility >= 1.0) {
            return false;
        }
        return _super.prototype.needAlphaBlendingForMesh.call(this, mesh);
    };
    /**
     * Specifies whether or not this material should be rendered in alpha test mode.
     */
    PBRBaseMaterial.prototype.needAlphaTesting = function () {
        if (this._forceAlphaTest) {
            return true;
        }
        if (this.subSurface.disableAlphaBlending) {
            return false;
        }
        return this._albedoTexture != null && this._albedoTexture.hasAlpha && (this._transparencyMode == null || this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_ALPHATEST);
    };
    /**
     * Specifies whether or not the alpha value of the albedo texture should be used for alpha blending.
     */
    PBRBaseMaterial.prototype._shouldUseAlphaFromAlbedoTexture = function () {
        return this._albedoTexture != null && this._albedoTexture.hasAlpha && this._useAlphaFromAlbedoTexture && this._transparencyMode !== PBRBaseMaterial.PBRMATERIAL_OPAQUE;
    };
    /**
     * Gets the texture used for the alpha test.
     */
    PBRBaseMaterial.prototype.getAlphaTestTexture = function () {
        return this._albedoTexture;
    };
    /**
     * Specifies that the submesh is ready to be used.
     * @param mesh - BJS mesh.
     * @param subMesh - A submesh of the BJS mesh.  Used to check if it is ready.
     * @param useInstances - Specifies that instances should be used.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRBaseMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        if (subMesh.effect && this.isFrozen) {
            if (this._wasPreviouslyReady) {
                return true;
            }
        }
        if (!subMesh._materialDefines) {
            subMesh._materialDefines = new PBRMaterialDefines();
        }
        var defines = subMesh._materialDefines;
        if (!this.checkReadyOnEveryCall && subMesh.effect) {
            if (defines._renderId === this.getScene().getRenderId()) {
                return true;
            }
        }
        var scene = this.getScene();
        var engine = scene.getEngine();
        if (defines._areTexturesDirty) {
            if (scene.texturesEnabled) {
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    if (!this._albedoTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    if (!this._ambientTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    if (!this._opacityTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                var reflectionTexture = this._getReflectionTexture();
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    if (!reflectionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    if (!this._lightmapTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    if (!this._emissiveTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        if (!this._metallicTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    else if (this._reflectivityTexture) {
                        if (!this._reflectivityTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    if (this._microSurfaceTexture) {
                        if (!this._microSurfaceTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                }
                if (engine.getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    // Bump texture cannot be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                }
                if (this._environmentBRDFTexture && MaterialFlags.ReflectionTextureEnabled) {
                    // This is blocking.
                    if (!this._environmentBRDFTexture.isReady()) {
                        return false;
                    }
                }
            }
        }
        if (!this.subSurface.isReadyForSubMesh(defines, scene) ||
            !this.clearCoat.isReadyForSubMesh(defines, scene, engine, this._disableBumpMap) ||
            !this.sheen.isReadyForSubMesh(defines, scene) ||
            !this.anisotropy.isReadyForSubMesh(defines, scene)) {
            return false;
        }
        if (defines._areImageProcessingDirty && this._imageProcessingConfiguration) {
            if (!this._imageProcessingConfiguration.isReady()) {
                return false;
            }
        }
        if (!engine.getCaps().standardDerivatives && !mesh.isVerticesDataPresent(VertexBuffer.NormalKind)) {
            mesh.createNormals(true);
            Logger.Warn("PBRMaterial: Normals have been created for the mesh: " + mesh.name);
        }
        var previousEffect = subMesh.effect;
        var effect = this._prepareEffect(mesh, defines, this.onCompiled, this.onError, useInstances);
        if (effect) {
            // Use previous effect while new one is compiling
            if (this.allowShaderHotSwapping && previousEffect && !effect.isReady()) {
                effect = previousEffect;
                defines.markAsUnprocessed();
            }
            else {
                scene.resetCachedMaterial();
                subMesh.setEffect(effect, defines);
                this.buildUniformLayout();
            }
        }
        if (!subMesh.effect || !subMesh.effect.isReady()) {
            return false;
        }
        defines._renderId = scene.getRenderId();
        this._wasPreviouslyReady = true;
        return true;
    };
    /**
     * Specifies if the material uses metallic roughness workflow.
     * @returns boolean specifiying if the material uses metallic roughness workflow.
    */
    PBRBaseMaterial.prototype.isMetallicWorkflow = function () {
        if (this._metallic != null || this._roughness != null || this._metallicTexture) {
            return true;
        }
        return false;
    };
    PBRBaseMaterial.prototype._prepareEffect = function (mesh, defines, onCompiled, onError, useInstances, useClipPlane) {
        if (onCompiled === void 0) { onCompiled = null; }
        if (onError === void 0) { onError = null; }
        if (useInstances === void 0) { useInstances = null; }
        if (useClipPlane === void 0) { useClipPlane = null; }
        this._prepareDefines(mesh, defines, useInstances, useClipPlane);
        if (!defines.isDirty) {
            return null;
        }
        defines.markAsProcessed();
        var scene = this.getScene();
        var engine = scene.getEngine();
        // Fallbacks
        var fallbacks = new EffectFallbacks();
        var fallbackRank = 0;
        if (defines.USESPHERICALINVERTEX) {
            fallbacks.addFallback(fallbackRank++, "USESPHERICALINVERTEX");
        }
        if (defines.FOG) {
            fallbacks.addFallback(fallbackRank, "FOG");
        }
        if (defines.SPECULARAA) {
            fallbacks.addFallback(fallbackRank, "SPECULARAA");
        }
        if (defines.POINTSIZE) {
            fallbacks.addFallback(fallbackRank, "POINTSIZE");
        }
        if (defines.LOGARITHMICDEPTH) {
            fallbacks.addFallback(fallbackRank, "LOGARITHMICDEPTH");
        }
        if (defines.PARALLAX) {
            fallbacks.addFallback(fallbackRank, "PARALLAX");
        }
        if (defines.PARALLAXOCCLUSION) {
            fallbacks.addFallback(fallbackRank++, "PARALLAXOCCLUSION");
        }
        fallbackRank = PBRAnisotropicConfiguration.AddFallbacks(defines, fallbacks, fallbackRank);
        fallbackRank = PBRAnisotropicConfiguration.AddFallbacks(defines, fallbacks, fallbackRank);
        fallbackRank = PBRSubSurfaceConfiguration.AddFallbacks(defines, fallbacks, fallbackRank);
        fallbackRank = PBRSheenConfiguration.AddFallbacks(defines, fallbacks, fallbackRank);
        if (defines.ENVIRONMENTBRDF) {
            fallbacks.addFallback(fallbackRank++, "ENVIRONMENTBRDF");
        }
        if (defines.TANGENT) {
            fallbacks.addFallback(fallbackRank++, "TANGENT");
        }
        if (defines.BUMP) {
            fallbacks.addFallback(fallbackRank++, "BUMP");
        }
        fallbackRank = MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights, fallbackRank++);
        if (defines.SPECULARTERM) {
            fallbacks.addFallback(fallbackRank++, "SPECULARTERM");
        }
        if (defines.USESPHERICALFROMREFLECTIONMAP) {
            fallbacks.addFallback(fallbackRank++, "USESPHERICALFROMREFLECTIONMAP");
        }
        if (defines.LIGHTMAP) {
            fallbacks.addFallback(fallbackRank++, "LIGHTMAP");
        }
        if (defines.NORMAL) {
            fallbacks.addFallback(fallbackRank++, "NORMAL");
        }
        if (defines.AMBIENT) {
            fallbacks.addFallback(fallbackRank++, "AMBIENT");
        }
        if (defines.EMISSIVE) {
            fallbacks.addFallback(fallbackRank++, "EMISSIVE");
        }
        if (defines.VERTEXCOLOR) {
            fallbacks.addFallback(fallbackRank++, "VERTEXCOLOR");
        }
        if (defines.NUM_BONE_INFLUENCERS > 0) {
            fallbacks.addCPUSkinningFallback(fallbackRank++, mesh);
        }
        if (defines.MORPHTARGETS) {
            fallbacks.addFallback(fallbackRank++, "MORPHTARGETS");
        }
        if (defines.MULTIVIEW) {
            fallbacks.addFallback(0, "MULTIVIEW");
        }
        //Attributes
        var attribs = [VertexBuffer.PositionKind];
        if (defines.NORMAL) {
            attribs.push(VertexBuffer.NormalKind);
        }
        if (defines.TANGENT) {
            attribs.push(VertexBuffer.TangentKind);
        }
        if (defines.UV1) {
            attribs.push(VertexBuffer.UVKind);
        }
        if (defines.UV2) {
            attribs.push(VertexBuffer.UV2Kind);
        }
        if (defines.VERTEXCOLOR) {
            attribs.push(VertexBuffer.ColorKind);
        }
        MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
        MaterialHelper.PrepareAttributesForInstances(attribs, defines);
        MaterialHelper.PrepareAttributesForMorphTargets(attribs, mesh, defines);
        var shaderName = "pbr";
        var uniforms = ["world", "view", "viewProjection", "vEyePosition", "vLightsType", "vAmbientColor", "vAlbedoColor", "vReflectivityColor", "vEmissiveColor", "visibility", "vReflectionColor",
            "vFogInfos", "vFogColor", "pointSize",
            "vAlbedoInfos", "vAmbientInfos", "vOpacityInfos", "vReflectionInfos", "vReflectionPosition", "vReflectionSize", "vEmissiveInfos", "vReflectivityInfos",
            "vMicroSurfaceSamplerInfos", "vBumpInfos", "vLightmapInfos",
            "mBones",
            "vClipPlane", "vClipPlane2", "vClipPlane3", "vClipPlane4", "albedoMatrix", "ambientMatrix", "opacityMatrix", "reflectionMatrix", "emissiveMatrix", "reflectivityMatrix", "normalMatrix", "microSurfaceSamplerMatrix", "bumpMatrix", "lightmapMatrix",
            "vLightingIntensity",
            "logarithmicDepthConstant",
            "vSphericalX", "vSphericalY", "vSphericalZ",
            "vSphericalXX_ZZ", "vSphericalYY_ZZ", "vSphericalZZ",
            "vSphericalXY", "vSphericalYZ", "vSphericalZX",
            "vSphericalL00",
            "vSphericalL1_1", "vSphericalL10", "vSphericalL11",
            "vSphericalL2_2", "vSphericalL2_1", "vSphericalL20", "vSphericalL21", "vSphericalL22",
            "vReflectionMicrosurfaceInfos",
            "vTangentSpaceParams", "boneTextureWidth",
            "vDebugMode"
        ];
        var samplers = ["albedoSampler", "reflectivitySampler", "ambientSampler", "emissiveSampler",
            "bumpSampler", "lightmapSampler", "opacitySampler",
            "reflectionSampler", "reflectionSamplerLow", "reflectionSamplerHigh",
            "microSurfaceSampler", "environmentBrdfSampler", "boneSampler"];
        var uniformBuffers = ["Material", "Scene"];
        PBRSubSurfaceConfiguration.AddUniforms(uniforms);
        PBRSubSurfaceConfiguration.AddSamplers(samplers);
        PBRClearCoatConfiguration.AddUniforms(uniforms);
        PBRClearCoatConfiguration.AddSamplers(samplers);
        PBRAnisotropicConfiguration.AddUniforms(uniforms);
        PBRAnisotropicConfiguration.AddSamplers(samplers);
        PBRSheenConfiguration.AddUniforms(uniforms);
        PBRSheenConfiguration.AddSamplers(samplers);
        if (ImageProcessingConfiguration) {
            ImageProcessingConfiguration.PrepareUniforms(uniforms, defines);
            ImageProcessingConfiguration.PrepareSamplers(samplers, defines);
        }
        MaterialHelper.PrepareUniformsAndSamplersList({
            uniformsNames: uniforms,
            uniformBuffersNames: uniformBuffers,
            samplers: samplers,
            defines: defines,
            maxSimultaneousLights: this._maxSimultaneousLights
        });
        if (this.customShaderNameResolve) {
            shaderName = this.customShaderNameResolve(shaderName, uniforms, uniformBuffers, samplers, defines);
        }
        var join = defines.toString();
        return engine.createEffect(shaderName, {
            attributes: attribs,
            uniformsNames: uniforms,
            uniformBuffersNames: uniformBuffers,
            samplers: samplers,
            defines: join,
            fallbacks: fallbacks,
            onCompiled: onCompiled,
            onError: onError,
            indexParameters: { maxSimultaneousLights: this._maxSimultaneousLights, maxSimultaneousMorphTargets: defines.NUM_MORPH_INFLUENCERS }
        }, engine);
    };
    PBRBaseMaterial.prototype._prepareDefines = function (mesh, defines, useInstances, useClipPlane) {
        if (useInstances === void 0) { useInstances = null; }
        if (useClipPlane === void 0) { useClipPlane = null; }
        var scene = this.getScene();
        var engine = scene.getEngine();
        // Lights
        MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
        defines._needNormals = true;
        // Multiview
        MaterialHelper.PrepareDefinesForMultiview(scene, defines);
        // Textures
        defines.METALLICWORKFLOW = this.isMetallicWorkflow();
        if (defines._areTexturesDirty) {
            defines._needUVs = false;
            if (scene.texturesEnabled) {
                if (scene.getEngine().getCaps().textureLOD) {
                    defines.LODBASEDMICROSFURACE = true;
                }
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._albedoTexture, defines, "ALBEDO");
                }
                else {
                    defines.ALBEDO = false;
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._ambientTexture, defines, "AMBIENT");
                    defines.AMBIENTINGRAYSCALE = this._useAmbientInGrayScale;
                }
                else {
                    defines.AMBIENT = false;
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._opacityTexture, defines, "OPACITY");
                    defines.OPACITYRGB = this._opacityTexture.getAlphaFromRGB;
                }
                else {
                    defines.OPACITY = false;
                }
                var reflectionTexture = this._getReflectionTexture();
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    defines.REFLECTION = true;
                    defines.GAMMAREFLECTION = reflectionTexture.gammaSpace;
                    defines.RGBDREFLECTION = reflectionTexture.isRGBD;
                    defines.REFLECTIONMAP_OPPOSITEZ = this.getScene().useRightHandedSystem ? !reflectionTexture.invertZ : reflectionTexture.invertZ;
                    defines.LODINREFLECTIONALPHA = reflectionTexture.lodLevelInAlpha;
                    if (reflectionTexture.coordinatesMode === Texture.INVCUBIC_MODE) {
                        defines.INVERTCUBICMAP = true;
                    }
                    defines.REFLECTIONMAP_3D = reflectionTexture.isCube;
                    defines.REFLECTIONMAP_CUBIC = false;
                    defines.REFLECTIONMAP_EXPLICIT = false;
                    defines.REFLECTIONMAP_PLANAR = false;
                    defines.REFLECTIONMAP_PROJECTION = false;
                    defines.REFLECTIONMAP_SKYBOX = false;
                    defines.REFLECTIONMAP_SPHERICAL = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
                    defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
                    defines.REFLECTIONMAP_SKYBOX_TRANSFORMED = false;
                    switch (reflectionTexture.coordinatesMode) {
                        case Texture.EXPLICIT_MODE:
                            defines.REFLECTIONMAP_EXPLICIT = true;
                            break;
                        case Texture.PLANAR_MODE:
                            defines.REFLECTIONMAP_PLANAR = true;
                            break;
                        case Texture.PROJECTION_MODE:
                            defines.REFLECTIONMAP_PROJECTION = true;
                            break;
                        case Texture.SKYBOX_MODE:
                            defines.REFLECTIONMAP_SKYBOX = true;
                            break;
                        case Texture.SPHERICAL_MODE:
                            defines.REFLECTIONMAP_SPHERICAL = true;
                            break;
                        case Texture.EQUIRECTANGULAR_MODE:
                            defines.REFLECTIONMAP_EQUIRECTANGULAR = true;
                            break;
                        case Texture.FIXED_EQUIRECTANGULAR_MODE:
                            defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = true;
                            break;
                        case Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE:
                            defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = true;
                            break;
                        case Texture.CUBIC_MODE:
                        case Texture.INVCUBIC_MODE:
                        default:
                            defines.REFLECTIONMAP_CUBIC = true;
                            defines.USE_LOCAL_REFLECTIONMAP_CUBIC = reflectionTexture.boundingBoxSize ? true : false;
                            break;
                    }
                    if (reflectionTexture.coordinatesMode !== Texture.SKYBOX_MODE) {
                        if (reflectionTexture.sphericalPolynomial) {
                            defines.USESPHERICALFROMREFLECTIONMAP = true;
                            if (this._forceIrradianceInFragment || scene.getEngine().getCaps().maxVaryingVectors <= 8) {
                                defines.USESPHERICALINVERTEX = false;
                            }
                            else {
                                defines.USESPHERICALINVERTEX = true;
                            }
                        }
                    }
                    else {
                        defines.REFLECTIONMAP_SKYBOX_TRANSFORMED = !reflectionTexture.getReflectionTextureMatrix().isIdentity();
                    }
                }
                else {
                    defines.REFLECTION = false;
                    defines.REFLECTIONMAP_3D = false;
                    defines.REFLECTIONMAP_SPHERICAL = false;
                    defines.REFLECTIONMAP_PLANAR = false;
                    defines.REFLECTIONMAP_CUBIC = false;
                    defines.USE_LOCAL_REFLECTIONMAP_CUBIC = false;
                    defines.REFLECTIONMAP_PROJECTION = false;
                    defines.REFLECTIONMAP_SKYBOX = false;
                    defines.REFLECTIONMAP_SKYBOX_TRANSFORMED = false;
                    defines.REFLECTIONMAP_EXPLICIT = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
                    defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
                    defines.INVERTCUBICMAP = false;
                    defines.USESPHERICALFROMREFLECTIONMAP = false;
                    defines.USESPHERICALINVERTEX = false;
                    defines.REFLECTIONMAP_OPPOSITEZ = false;
                    defines.LODINREFLECTIONALPHA = false;
                    defines.GAMMAREFLECTION = false;
                    defines.RGBDREFLECTION = false;
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._lightmapTexture, defines, "LIGHTMAP");
                    defines.USELIGHTMAPASSHADOWMAP = this._useLightmapAsShadowmap;
                    defines.GAMMALIGHTMAP = this._lightmapTexture.gammaSpace;
                }
                else {
                    defines.LIGHTMAP = false;
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._emissiveTexture, defines, "EMISSIVE");
                }
                else {
                    defines.EMISSIVE = false;
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._metallicTexture, defines, "REFLECTIVITY");
                        defines.ROUGHNESSSTOREINMETALMAPALPHA = this._useRoughnessFromMetallicTextureAlpha;
                        defines.ROUGHNESSSTOREINMETALMAPGREEN = !this._useRoughnessFromMetallicTextureAlpha && this._useRoughnessFromMetallicTextureGreen;
                        defines.METALLNESSSTOREINMETALMAPBLUE = this._useMetallnessFromMetallicTextureBlue;
                        defines.AOSTOREINMETALMAPRED = this._useAmbientOcclusionFromMetallicTextureRed;
                    }
                    else if (this._reflectivityTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._reflectivityTexture, defines, "REFLECTIVITY");
                        defines.MICROSURFACEFROMREFLECTIVITYMAP = this._useMicroSurfaceFromReflectivityMapAlpha;
                        defines.MICROSURFACEAUTOMATIC = this._useAutoMicroSurfaceFromReflectivityMap;
                    }
                    else {
                        defines.REFLECTIVITY = false;
                    }
                    if (this._microSurfaceTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._microSurfaceTexture, defines, "MICROSURFACEMAP");
                    }
                    else {
                        defines.MICROSURFACEMAP = false;
                    }
                }
                else {
                    defines.REFLECTIVITY = false;
                    defines.MICROSURFACEMAP = false;
                }
                if (scene.getEngine().getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "BUMP");
                    if (this._useParallax && this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                        defines.PARALLAX = true;
                        defines.PARALLAXOCCLUSION = !!this._useParallaxOcclusion;
                    }
                    else {
                        defines.PARALLAX = false;
                    }
                    defines.OBJECTSPACE_NORMALMAP = this._useObjectSpaceNormalMap;
                }
                else {
                    defines.BUMP = false;
                }
                if (this._environmentBRDFTexture && MaterialFlags.ReflectionTextureEnabled) {
                    defines.ENVIRONMENTBRDF = true;
                    // Not actual true RGBD, only the B chanel is encoded as RGBD for sheen.
                    defines.ENVIRONMENTBRDF_RGBD = this._environmentBRDFTexture.isRGBD;
                }
                else {
                    defines.ENVIRONMENTBRDF = false;
                    defines.ENVIRONMENTBRDF_RGBD = false;
                }
                if (this._shouldUseAlphaFromAlbedoTexture()) {
                    defines.ALPHAFROMALBEDO = true;
                }
                else {
                    defines.ALPHAFROMALBEDO = false;
                }
            }
            defines.SPECULAROVERALPHA = this._useSpecularOverAlpha;
            if (this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_STANDARD) {
                defines.USEPHYSICALLIGHTFALLOFF = false;
                defines.USEGLTFLIGHTFALLOFF = false;
            }
            else if (this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_GLTF) {
                defines.USEPHYSICALLIGHTFALLOFF = false;
                defines.USEGLTFLIGHTFALLOFF = true;
            }
            else {
                defines.USEPHYSICALLIGHTFALLOFF = true;
                defines.USEGLTFLIGHTFALLOFF = false;
            }
            defines.RADIANCEOVERALPHA = this._useRadianceOverAlpha;
            if (!this.backFaceCulling && this._twoSidedLighting) {
                defines.TWOSIDEDLIGHTING = true;
            }
            else {
                defines.TWOSIDEDLIGHTING = false;
            }
            defines.ALPHATESTVALUE = "" + this._alphaCutOff + (this._alphaCutOff % 1 === 0 ? "." : "");
            defines.PREMULTIPLYALPHA = (this.alphaMode === Constants.ALPHA_PREMULTIPLIED || this.alphaMode === Constants.ALPHA_PREMULTIPLIED_PORTERDUFF);
            defines.ALPHABLEND = this.needAlphaBlendingForMesh(mesh);
            defines.ALPHAFRESNEL = this._useAlphaFresnel || this._useLinearAlphaFresnel;
            defines.LINEARALPHAFRESNEL = this._useLinearAlphaFresnel;
            defines.SPECULARAA = scene.getEngine().getCaps().standardDerivatives && this._enableSpecularAntiAliasing;
        }
        if (defines._areImageProcessingDirty && this._imageProcessingConfiguration) {
            this._imageProcessingConfiguration.prepareDefines(defines);
        }
        defines.FORCENORMALFORWARD = this._forceNormalForward;
        defines.RADIANCEOCCLUSION = this._useRadianceOcclusion;
        defines.HORIZONOCCLUSION = this._useHorizonOcclusion;
        // Misc.
        if (defines._areMiscDirty) {
            MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, this._shouldTurnAlphaTestOn(mesh) || this._forceAlphaTest, defines);
            defines.UNLIT = this._unlit || ((this.pointsCloud || this.wireframe) && !mesh.isVerticesDataPresent(VertexBuffer.NormalKind));
            defines.DEBUGMODE = this._debugMode;
        }
        // External config
        this.subSurface.prepareDefines(defines, scene);
        this.clearCoat.prepareDefines(defines, scene);
        this.anisotropy.prepareDefines(defines, mesh, scene);
        this.brdf.prepareDefines(defines);
        this.sheen.prepareDefines(defines, scene);
        // Values that need to be evaluated on every frame
        MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances ? true : false, useClipPlane);
        // Attribs
        MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true, true, this._transparencyMode !== PBRBaseMaterial.PBRMATERIAL_OPAQUE);
    };
    /**
     * Force shader compilation
     */
    PBRBaseMaterial.prototype.forceCompilation = function (mesh, onCompiled, options) {
        var _this = this;
        var localOptions = __assign({ clipPlane: false }, options);
        var defines = new PBRMaterialDefines();
        var effect = this._prepareEffect(mesh, defines, undefined, undefined, undefined, localOptions.clipPlane);
        if (effect.isReady()) {
            if (onCompiled) {
                onCompiled(this);
            }
        }
        else {
            effect.onCompileObservable.add(function () {
                if (onCompiled) {
                    onCompiled(_this);
                }
            });
        }
    };
    /**
     * Initializes the uniform buffer layout for the shader.
     */
    PBRBaseMaterial.prototype.buildUniformLayout = function () {
        // Order is important !
        var ubo = this._uniformBuffer;
        ubo.addUniform("vAlbedoInfos", 2);
        ubo.addUniform("vAmbientInfos", 4);
        ubo.addUniform("vOpacityInfos", 2);
        ubo.addUniform("vEmissiveInfos", 2);
        ubo.addUniform("vLightmapInfos", 2);
        ubo.addUniform("vReflectivityInfos", 3);
        ubo.addUniform("vMicroSurfaceSamplerInfos", 2);
        ubo.addUniform("vReflectionInfos", 2);
        ubo.addUniform("vReflectionPosition", 3);
        ubo.addUniform("vReflectionSize", 3);
        ubo.addUniform("vBumpInfos", 3);
        ubo.addUniform("albedoMatrix", 16);
        ubo.addUniform("ambientMatrix", 16);
        ubo.addUniform("opacityMatrix", 16);
        ubo.addUniform("emissiveMatrix", 16);
        ubo.addUniform("lightmapMatrix", 16);
        ubo.addUniform("reflectivityMatrix", 16);
        ubo.addUniform("microSurfaceSamplerMatrix", 16);
        ubo.addUniform("bumpMatrix", 16);
        ubo.addUniform("vTangentSpaceParams", 2);
        ubo.addUniform("reflectionMatrix", 16);
        ubo.addUniform("vReflectionColor", 3);
        ubo.addUniform("vAlbedoColor", 4);
        ubo.addUniform("vLightingIntensity", 4);
        ubo.addUniform("vReflectionMicrosurfaceInfos", 3);
        ubo.addUniform("pointSize", 1);
        ubo.addUniform("vReflectivityColor", 4);
        ubo.addUniform("vEmissiveColor", 3);
        ubo.addUniform("visibility", 1);
        PBRClearCoatConfiguration.PrepareUniformBuffer(ubo);
        PBRAnisotropicConfiguration.PrepareUniformBuffer(ubo);
        PBRSheenConfiguration.PrepareUniformBuffer(ubo);
        PBRSubSurfaceConfiguration.PrepareUniformBuffer(ubo);
        ubo.create();
    };
    /**
     * Unbinds the material from the mesh
     */
    PBRBaseMaterial.prototype.unbind = function () {
        if (this._activeEffect) {
            var needFlag = false;
            if (this._reflectionTexture && this._reflectionTexture.isRenderTarget) {
                this._activeEffect.setTexture("reflection2DSampler", null);
                needFlag = true;
            }
            if (this.subSurface.unbind(this._activeEffect)) {
                needFlag = true;
            }
            if (needFlag) {
                this._markAllSubMeshesAsTexturesDirty();
            }
        }
        _super.prototype.unbind.call(this);
    };
    /**
     * Binds the submesh data.
     * @param world - The world matrix.
     * @param mesh - The BJS mesh.
     * @param subMesh - A submesh of the BJS mesh.
     */
    PBRBaseMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var scene = this.getScene();
        var defines = subMesh._materialDefines;
        if (!defines) {
            return;
        }
        var effect = subMesh.effect;
        if (!effect) {
            return;
        }
        this._activeEffect = effect;
        // Matrices
        if (!defines.INSTANCES) {
            this.bindOnlyWorldMatrix(world);
        }
        // Normal Matrix
        if (defines.OBJECTSPACE_NORMALMAP) {
            world.toNormalMatrix(this._normalMatrix);
            this.bindOnlyNormalMatrix(this._normalMatrix);
        }
        var mustRebind = this._mustRebind(scene, effect, mesh.visibility);
        // Bones
        MaterialHelper.BindBonesParameters(mesh, this._activeEffect);
        var reflectionTexture = null;
        var ubo = this._uniformBuffer;
        if (mustRebind) {
            var engine = scene.getEngine();
            ubo.bindToEffect(effect, "Material");
            this.bindViewProjection(effect);
            reflectionTexture = this._getReflectionTexture();
            if (!ubo.useUbo || !this.isFrozen || !ubo.isSync) {
                // Texture uniforms
                if (scene.texturesEnabled) {
                    if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                        ubo.updateFloat2("vAlbedoInfos", this._albedoTexture.coordinatesIndex, this._albedoTexture.level);
                        MaterialHelper.BindTextureMatrix(this._albedoTexture, ubo, "albedo");
                    }
                    if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                        ubo.updateFloat4("vAmbientInfos", this._ambientTexture.coordinatesIndex, this._ambientTexture.level, this._ambientTextureStrength, this._ambientTextureImpactOnAnalyticalLights);
                        MaterialHelper.BindTextureMatrix(this._ambientTexture, ubo, "ambient");
                    }
                    if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                        ubo.updateFloat2("vOpacityInfos", this._opacityTexture.coordinatesIndex, this._opacityTexture.level);
                        MaterialHelper.BindTextureMatrix(this._opacityTexture, ubo, "opacity");
                    }
                    if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                        ubo.updateMatrix("reflectionMatrix", reflectionTexture.getReflectionTextureMatrix());
                        ubo.updateFloat2("vReflectionInfos", reflectionTexture.level, 0);
                        if (reflectionTexture.boundingBoxSize) {
                            var cubeTexture = reflectionTexture;
                            ubo.updateVector3("vReflectionPosition", cubeTexture.boundingBoxPosition);
                            ubo.updateVector3("vReflectionSize", cubeTexture.boundingBoxSize);
                        }
                        var polynomials = reflectionTexture.sphericalPolynomial;
                        if (defines.USESPHERICALFROMREFLECTIONMAP && polynomials) {
                            if (defines.SPHERICAL_HARMONICS) {
                                var preScaledHarmonics = polynomials.preScaledHarmonics;
                                this._activeEffect.setVector3("vSphericalL00", preScaledHarmonics.l00);
                                this._activeEffect.setVector3("vSphericalL1_1", preScaledHarmonics.l1_1);
                                this._activeEffect.setVector3("vSphericalL10", preScaledHarmonics.l10);
                                this._activeEffect.setVector3("vSphericalL11", preScaledHarmonics.l11);
                                this._activeEffect.setVector3("vSphericalL2_2", preScaledHarmonics.l2_2);
                                this._activeEffect.setVector3("vSphericalL2_1", preScaledHarmonics.l2_1);
                                this._activeEffect.setVector3("vSphericalL20", preScaledHarmonics.l20);
                                this._activeEffect.setVector3("vSphericalL21", preScaledHarmonics.l21);
                                this._activeEffect.setVector3("vSphericalL22", preScaledHarmonics.l22);
                            }
                            else {
                                this._activeEffect.setFloat3("vSphericalX", polynomials.x.x, polynomials.x.y, polynomials.x.z);
                                this._activeEffect.setFloat3("vSphericalY", polynomials.y.x, polynomials.y.y, polynomials.y.z);
                                this._activeEffect.setFloat3("vSphericalZ", polynomials.z.x, polynomials.z.y, polynomials.z.z);
                                this._activeEffect.setFloat3("vSphericalXX_ZZ", polynomials.xx.x - polynomials.zz.x, polynomials.xx.y - polynomials.zz.y, polynomials.xx.z - polynomials.zz.z);
                                this._activeEffect.setFloat3("vSphericalYY_ZZ", polynomials.yy.x - polynomials.zz.x, polynomials.yy.y - polynomials.zz.y, polynomials.yy.z - polynomials.zz.z);
                                this._activeEffect.setFloat3("vSphericalZZ", polynomials.zz.x, polynomials.zz.y, polynomials.zz.z);
                                this._activeEffect.setFloat3("vSphericalXY", polynomials.xy.x, polynomials.xy.y, polynomials.xy.z);
                                this._activeEffect.setFloat3("vSphericalYZ", polynomials.yz.x, polynomials.yz.y, polynomials.yz.z);
                                this._activeEffect.setFloat3("vSphericalZX", polynomials.zx.x, polynomials.zx.y, polynomials.zx.z);
                            }
                        }
                        ubo.updateFloat3("vReflectionMicrosurfaceInfos", reflectionTexture.getSize().width, reflectionTexture.lodGenerationScale, reflectionTexture.lodGenerationOffset);
                    }
                    if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                        ubo.updateFloat2("vEmissiveInfos", this._emissiveTexture.coordinatesIndex, this._emissiveTexture.level);
                        MaterialHelper.BindTextureMatrix(this._emissiveTexture, ubo, "emissive");
                    }
                    if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                        ubo.updateFloat2("vLightmapInfos", this._lightmapTexture.coordinatesIndex, this._lightmapTexture.level);
                        MaterialHelper.BindTextureMatrix(this._lightmapTexture, ubo, "lightmap");
                    }
                    if (MaterialFlags.SpecularTextureEnabled) {
                        if (this._metallicTexture) {
                            ubo.updateFloat3("vReflectivityInfos", this._metallicTexture.coordinatesIndex, this._metallicTexture.level, this._ambientTextureStrength);
                            MaterialHelper.BindTextureMatrix(this._metallicTexture, ubo, "reflectivity");
                        }
                        else if (this._reflectivityTexture) {
                            ubo.updateFloat3("vReflectivityInfos", this._reflectivityTexture.coordinatesIndex, this._reflectivityTexture.level, 1.0);
                            MaterialHelper.BindTextureMatrix(this._reflectivityTexture, ubo, "reflectivity");
                        }
                        if (this._microSurfaceTexture) {
                            ubo.updateFloat2("vMicroSurfaceSamplerInfos", this._microSurfaceTexture.coordinatesIndex, this._microSurfaceTexture.level);
                            MaterialHelper.BindTextureMatrix(this._microSurfaceTexture, ubo, "microSurfaceSampler");
                        }
                    }
                    if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                        ubo.updateFloat3("vBumpInfos", this._bumpTexture.coordinatesIndex, this._bumpTexture.level, this._parallaxScaleBias);
                        MaterialHelper.BindTextureMatrix(this._bumpTexture, ubo, "bump");
                        if (scene._mirroredCameraPosition) {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? 1.0 : -1.0, this._invertNormalMapY ? 1.0 : -1.0);
                        }
                        else {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? -1.0 : 1.0, this._invertNormalMapY ? -1.0 : 1.0);
                        }
                    }
                }
                // Point size
                if (this.pointsCloud) {
                    ubo.updateFloat("pointSize", this.pointSize);
                }
                // Colors
                if (defines.METALLICWORKFLOW) {
                    Tmp.Color3[0].r = (this._metallic === undefined || this._metallic === null) ? 1 : this._metallic;
                    Tmp.Color3[0].g = (this._roughness === undefined || this._roughness === null) ? 1 : this._roughness;
                    ubo.updateColor4("vReflectivityColor", Tmp.Color3[0], 0);
                }
                else {
                    ubo.updateColor4("vReflectivityColor", this._reflectivityColor, this._microSurface);
                }
                ubo.updateColor3("vEmissiveColor", MaterialFlags.EmissiveTextureEnabled ? this._emissiveColor : Color3.BlackReadOnly);
                ubo.updateColor3("vReflectionColor", this._reflectionColor);
                ubo.updateColor4("vAlbedoColor", this._albedoColor, this.alpha);
                // Visibility
                ubo.updateFloat("visibility", mesh.visibility);
                // Misc
                this._lightingInfos.x = this._directIntensity;
                this._lightingInfos.y = this._emissiveIntensity;
                this._lightingInfos.z = this._environmentIntensity;
                this._lightingInfos.w = this._specularIntensity;
                ubo.updateVector4("vLightingIntensity", this._lightingInfos);
            }
            // Textures
            if (scene.texturesEnabled) {
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    ubo.setTexture("albedoSampler", this._albedoTexture);
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    ubo.setTexture("ambientSampler", this._ambientTexture);
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    ubo.setTexture("opacitySampler", this._opacityTexture);
                }
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    if (defines.LODBASEDMICROSFURACE) {
                        ubo.setTexture("reflectionSampler", reflectionTexture);
                    }
                    else {
                        ubo.setTexture("reflectionSampler", reflectionTexture._lodTextureMid || reflectionTexture);
                        ubo.setTexture("reflectionSamplerLow", reflectionTexture._lodTextureLow || reflectionTexture);
                        ubo.setTexture("reflectionSamplerHigh", reflectionTexture._lodTextureHigh || reflectionTexture);
                    }
                }
                if (defines.ENVIRONMENTBRDF) {
                    ubo.setTexture("environmentBrdfSampler", this._environmentBRDFTexture);
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    ubo.setTexture("emissiveSampler", this._emissiveTexture);
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    ubo.setTexture("lightmapSampler", this._lightmapTexture);
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        ubo.setTexture("reflectivitySampler", this._metallicTexture);
                    }
                    else if (this._reflectivityTexture) {
                        ubo.setTexture("reflectivitySampler", this._reflectivityTexture);
                    }
                    if (this._microSurfaceTexture) {
                        ubo.setTexture("microSurfaceSampler", this._microSurfaceTexture);
                    }
                }
                if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    ubo.setTexture("bumpSampler", this._bumpTexture);
                }
            }
            this.subSurface.bindForSubMesh(ubo, scene, engine, this.isFrozen, defines.LODBASEDMICROSFURACE);
            this.clearCoat.bindForSubMesh(ubo, scene, engine, this._disableBumpMap, this.isFrozen, this._invertNormalMapX, this._invertNormalMapY);
            this.anisotropy.bindForSubMesh(ubo, scene, this.isFrozen);
            this.sheen.bindForSubMesh(ubo, scene, this.isFrozen);
            // Clip plane
            MaterialHelper.BindClipPlane(this._activeEffect, scene);
            // Colors
            scene.ambientColor.multiplyToRef(this._ambientColor, this._globalAmbientColor);
            var eyePosition = scene._forcedViewPosition ? scene._forcedViewPosition : (scene._mirroredCameraPosition ? scene._mirroredCameraPosition : scene.activeCamera.globalPosition);
            var invertNormal = (scene.useRightHandedSystem === (scene._mirroredCameraPosition != null));
            effect.setFloat4("vEyePosition", eyePosition.x, eyePosition.y, eyePosition.z, invertNormal ? -1 : 1);
            effect.setColor3("vAmbientColor", this._globalAmbientColor);
            effect.setFloat2("vDebugMode", this.debugLimit, this.debugFactor);
        }
        if (mustRebind || !this.isFrozen) {
            // Lights
            if (scene.lightsEnabled && !this._disableLighting) {
                MaterialHelper.BindLights(scene, mesh, this._activeEffect, defines, this._maxSimultaneousLights, this._lightFalloff !== PBRBaseMaterial.LIGHTFALLOFF_STANDARD);
            }
            // View
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE || reflectionTexture) {
                this.bindView(effect);
            }
            // Fog
            MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect, true);
            // Morph targets
            if (defines.NUM_MORPH_INFLUENCERS) {
                MaterialHelper.BindMorphTargetParameters(mesh, this._activeEffect);
            }
            // image processing
            this._imageProcessingConfiguration.bind(this._activeEffect);
            // Log. depth
            MaterialHelper.BindLogDepth(defines, this._activeEffect, scene);
        }
        ubo.update();
        this._afterBind(mesh, this._activeEffect);
    };
    /**
     * Returns the animatable textures.
     * @returns - Array of animatable textures.
     */
    PBRBaseMaterial.prototype.getAnimatables = function () {
        var results = [];
        if (this._albedoTexture && this._albedoTexture.animations && this._albedoTexture.animations.length > 0) {
            results.push(this._albedoTexture);
        }
        if (this._ambientTexture && this._ambientTexture.animations && this._ambientTexture.animations.length > 0) {
            results.push(this._ambientTexture);
        }
        if (this._opacityTexture && this._opacityTexture.animations && this._opacityTexture.animations.length > 0) {
            results.push(this._opacityTexture);
        }
        if (this._reflectionTexture && this._reflectionTexture.animations && this._reflectionTexture.animations.length > 0) {
            results.push(this._reflectionTexture);
        }
        if (this._emissiveTexture && this._emissiveTexture.animations && this._emissiveTexture.animations.length > 0) {
            results.push(this._emissiveTexture);
        }
        if (this._metallicTexture && this._metallicTexture.animations && this._metallicTexture.animations.length > 0) {
            results.push(this._metallicTexture);
        }
        else if (this._reflectivityTexture && this._reflectivityTexture.animations && this._reflectivityTexture.animations.length > 0) {
            results.push(this._reflectivityTexture);
        }
        if (this._bumpTexture && this._bumpTexture.animations && this._bumpTexture.animations.length > 0) {
            results.push(this._bumpTexture);
        }
        if (this._lightmapTexture && this._lightmapTexture.animations && this._lightmapTexture.animations.length > 0) {
            results.push(this._lightmapTexture);
        }
        this.subSurface.getAnimatables(results);
        this.clearCoat.getAnimatables(results);
        this.sheen.getAnimatables(results);
        this.anisotropy.getAnimatables(results);
        return results;
    };
    /**
     * Returns the texture used for reflections.
     * @returns - Reflection texture if present.  Otherwise, returns the environment texture.
     */
    PBRBaseMaterial.prototype._getReflectionTexture = function () {
        if (this._reflectionTexture) {
            return this._reflectionTexture;
        }
        return this.getScene().environmentTexture;
    };
    /**
     * Returns an array of the actively used textures.
     * @returns - Array of BaseTextures
     */
    PBRBaseMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        if (this._albedoTexture) {
            activeTextures.push(this._albedoTexture);
        }
        if (this._ambientTexture) {
            activeTextures.push(this._ambientTexture);
        }
        if (this._opacityTexture) {
            activeTextures.push(this._opacityTexture);
        }
        if (this._reflectionTexture) {
            activeTextures.push(this._reflectionTexture);
        }
        if (this._emissiveTexture) {
            activeTextures.push(this._emissiveTexture);
        }
        if (this._reflectivityTexture) {
            activeTextures.push(this._reflectivityTexture);
        }
        if (this._metallicTexture) {
            activeTextures.push(this._metallicTexture);
        }
        if (this._microSurfaceTexture) {
            activeTextures.push(this._microSurfaceTexture);
        }
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        if (this._lightmapTexture) {
            activeTextures.push(this._lightmapTexture);
        }
        this.subSurface.getActiveTextures(activeTextures);
        this.clearCoat.getActiveTextures(activeTextures);
        this.sheen.getActiveTextures(activeTextures);
        this.anisotropy.getActiveTextures(activeTextures);
        return activeTextures;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRBaseMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        if (this._albedoTexture === texture) {
            return true;
        }
        if (this._ambientTexture === texture) {
            return true;
        }
        if (this._opacityTexture === texture) {
            return true;
        }
        if (this._reflectionTexture === texture) {
            return true;
        }
        if (this._reflectivityTexture === texture) {
            return true;
        }
        if (this._metallicTexture === texture) {
            return true;
        }
        if (this._microSurfaceTexture === texture) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        if (this._lightmapTexture === texture) {
            return true;
        }
        return this.subSurface.hasTexture(texture) ||
            this.clearCoat.hasTexture(texture) ||
            this.sheen.hasTexture(texture) ||
            this.anisotropy.hasTexture(texture);
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeEffect - Forces the disposal of effects.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRBaseMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures) {
        if (forceDisposeTextures) {
            if (this._albedoTexture) {
                this._albedoTexture.dispose();
            }
            if (this._ambientTexture) {
                this._ambientTexture.dispose();
            }
            if (this._opacityTexture) {
                this._opacityTexture.dispose();
            }
            if (this._reflectionTexture) {
                this._reflectionTexture.dispose();
            }
            if (this._environmentBRDFTexture && this.getScene().environmentBRDFTexture !== this._environmentBRDFTexture) {
                this._environmentBRDFTexture.dispose();
            }
            if (this._emissiveTexture) {
                this._emissiveTexture.dispose();
            }
            if (this._metallicTexture) {
                this._metallicTexture.dispose();
            }
            if (this._reflectivityTexture) {
                this._reflectivityTexture.dispose();
            }
            if (this._bumpTexture) {
                this._bumpTexture.dispose();
            }
            if (this._lightmapTexture) {
                this._lightmapTexture.dispose();
            }
        }
        this.subSurface.dispose(forceDisposeTextures);
        this.clearCoat.dispose(forceDisposeTextures);
        this.sheen.dispose(forceDisposeTextures);
        this.anisotropy.dispose(forceDisposeTextures);
        this._renderTargets.dispose();
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures);
    };
    /**
     * PBRMaterialTransparencyMode: No transparency mode, Alpha channel is not use.
     */
    PBRBaseMaterial.PBRMATERIAL_OPAQUE = 0;
    /**
     * PBRMaterialTransparencyMode: Alpha Test mode, pixel are discarded below a certain threshold defined by the alpha cutoff value.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHATEST = 1;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHABLEND = 2;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     * They are also discarded below the alpha cutoff threshold to improve performances.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHATESTANDBLEND = 3;
    /**
     * Defines the default value of how much AO map is occluding the analytical lights
     * (point spot...).
     */
    PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS = 0;
    /**
     * PBRMaterialLightFalloff Physical: light is falling off following the inverse squared distance law.
     */
    PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL = 0;
    /**
     * PBRMaterialLightFalloff gltf: light is falling off as described in the gltf moving to PBR document
     * to enhance interoperability with other engines.
     */
    PBRBaseMaterial.LIGHTFALLOFF_GLTF = 1;
    /**
     * PBRMaterialLightFalloff Standard: light is falling off like in the standard material
     * to enhance interoperability with other materials.
     */
    PBRBaseMaterial.LIGHTFALLOFF_STANDARD = 2;
    __decorate([
        serializeAsImageProcessingConfiguration()
    ], PBRBaseMaterial.prototype, "_imageProcessingConfiguration", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBaseMaterial.prototype, "debugMode", void 0);
    __decorate([
        serialize()
    ], PBRBaseMaterial.prototype, "useLogarithmicDepth", null);
    __decorate([
        serialize()
    ], PBRBaseMaterial.prototype, "transparencyMode", null);
    return PBRBaseMaterial;
}(PushMaterial));

/**
 * The Physically based material of BJS.
 *
 * This offers the main features of a standard PBR material.
 * For more information, please refer to the documentation :
 * http://doc.babylonjs.com/extensions/Physically_Based_Rendering
 */
var PBRMaterial = /** @class */ (function (_super) {
    __extends(PBRMaterial, _super);
    /**
     * Instantiates a new PBRMaterial instance.
     *
     * @param name The material name
     * @param scene The scene the material will be use in.
     */
    function PBRMaterial(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        /**
         * Intensity of the direct lights e.g. the four lights available in your scene.
         * This impacts both the direct diffuse and specular highlights.
         */
        _this.directIntensity = 1.0;
        /**
         * Intensity of the emissive part of the material.
         * This helps controlling the emissive effect without modifying the emissive color.
         */
        _this.emissiveIntensity = 1.0;
        /**
         * Intensity of the environment e.g. how much the environment will light the object
         * either through harmonics for rough material or through the refelction for shiny ones.
         */
        _this.environmentIntensity = 1.0;
        /**
         * This is a special control allowing the reduction of the specular highlights coming from the
         * four lights of the scene. Those highlights may not be needed in full environment lighting.
         */
        _this.specularIntensity = 1.0;
        /**
         * Debug Control allowing disabling the bump map on this material.
         */
        _this.disableBumpMap = false;
        /**
         * AKA Occlusion Texture Intensity in other nomenclature.
         */
        _this.ambientTextureStrength = 1.0;
        /**
         * Defines how much the AO map is occluding the analytical lights (point spot...).
         * 1 means it completely occludes it
         * 0 mean it has no impact
         */
        _this.ambientTextureImpactOnAnalyticalLights = PBRMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS;
        /**
         * The color of a material in ambient lighting.
         */
        _this.ambientColor = new Color3(0, 0, 0);
        /**
         * AKA Diffuse Color in other nomenclature.
         */
        _this.albedoColor = new Color3(1, 1, 1);
        /**
         * AKA Specular Color in other nomenclature.
         */
        _this.reflectivityColor = new Color3(1, 1, 1);
        /**
         * The color reflected from the material.
         */
        _this.reflectionColor = new Color3(1.0, 1.0, 1.0);
        /**
         * The color emitted from the material.
         */
        _this.emissiveColor = new Color3(0, 0, 0);
        /**
         * AKA Glossiness in other nomenclature.
         */
        _this.microSurface = 1.0;
        /**
         * If true, the light map contains occlusion information instead of lighting info.
         */
        _this.useLightmapAsShadowmap = false;
        /**
         * Specifies that the alpha is coming form the albedo channel alpha channel for alpha blending.
         */
        _this.useAlphaFromAlbedoTexture = false;
        /**
         * Enforces alpha test in opaque or blend mode in order to improve the performances of some situations.
         */
        _this.forceAlphaTest = false;
        /**
         * Defines the alpha limits in alpha test mode.
         */
        _this.alphaCutOff = 0.4;
        /**
         * Specifies that the material will keep the specular highlights over a transparent surface (only the most limunous ones).
         * A car glass is a good exemple of that. When sun reflects on it you can not see what is behind.
         */
        _this.useSpecularOverAlpha = true;
        /**
         * Specifies if the reflectivity texture contains the glossiness information in its alpha channel.
         */
        _this.useMicroSurfaceFromReflectivityMapAlpha = false;
        /**
         * Specifies if the metallic texture contains the roughness information in its alpha channel.
         */
        _this.useRoughnessFromMetallicTextureAlpha = true;
        /**
         * Specifies if the metallic texture contains the roughness information in its green channel.
         */
        _this.useRoughnessFromMetallicTextureGreen = false;
        /**
         * Specifies if the metallic texture contains the metallness information in its blue channel.
         */
        _this.useMetallnessFromMetallicTextureBlue = false;
        /**
         * Specifies if the metallic texture contains the ambient occlusion information in its red channel.
         */
        _this.useAmbientOcclusionFromMetallicTextureRed = false;
        /**
         * Specifies if the ambient texture contains the ambient occlusion information in its red channel only.
         */
        _this.useAmbientInGrayScale = false;
        /**
         * In case the reflectivity map does not contain the microsurface information in its alpha channel,
         * The material will try to infer what glossiness each pixel should be.
         */
        _this.useAutoMicroSurfaceFromReflectivityMap = false;
        /**
         * Specifies that the material will keeps the reflection highlights over a transparent surface (only the most limunous ones).
         * A car glass is a good exemple of that. When the street lights reflects on it you can not see what is behind.
         */
        _this.useRadianceOverAlpha = true;
        /**
         * Allows using an object space normal map (instead of tangent space).
         */
        _this.useObjectSpaceNormalMap = false;
        /**
         * Allows using the bump map in parallax mode.
         */
        _this.useParallax = false;
        /**
         * Allows using the bump map in parallax occlusion mode.
         */
        _this.useParallaxOcclusion = false;
        /**
         * Controls the scale bias of the parallax mode.
         */
        _this.parallaxScaleBias = 0.05;
        /**
         * If sets to true, disables all the lights affecting the material.
         */
        _this.disableLighting = false;
        /**
         * Force the shader to compute irradiance in the fragment shader in order to take bump in account.
         */
        _this.forceIrradianceInFragment = false;
        /**
         * Number of Simultaneous lights allowed on the material.
         */
        _this.maxSimultaneousLights = 4;
        /**
         * If sets to true, x component of normal map value will invert (x = 1.0 - x).
         */
        _this.invertNormalMapX = false;
        /**
         * If sets to true, y component of normal map value will invert (y = 1.0 - y).
         */
        _this.invertNormalMapY = false;
        /**
         * If sets to true and backfaceCulling is false, normals will be flipped on the backside.
         */
        _this.twoSidedLighting = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha is converted to gamma to compute the fresnel)
         */
        _this.useAlphaFresnel = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha stays linear to compute the fresnel)
         */
        _this.useLinearAlphaFresnel = false;
        /**
         * Let user defines the brdf lookup texture used for IBL.
         * A default 8bit version is embedded but you could point at :
         * * Default texture: https://assets.babylonjs.com/environments/correlatedMSBRDF.png
         * * Default 16bit pixel depth texture: https://assets.babylonjs.com/environments/correlatedMSBRDF.dds
         * * LEGACY Default None correlated https://assets.babylonjs.com/environments/uncorrelatedBRDF.png
         * * LEGACY Default None correlated 16bit pixel depth https://assets.babylonjs.com/environments/uncorrelatedBRDF.dds
         */
        _this.environmentBRDFTexture = null;
        /**
         * Force normal to face away from face.
         */
        _this.forceNormalForward = false;
        /**
         * Enables specular anti aliasing in the PBR shader.
         * It will both interacts on the Geometry for analytical and IBL lighting.
         * It also prefilter the roughness map based on the bump values.
         */
        _this.enableSpecularAntiAliasing = false;
        /**
         * This parameters will enable/disable Horizon occlusion to prevent normal maps to look shiny when the normal
         * makes the reflect vector face the model (under horizon).
         */
        _this.useHorizonOcclusion = true;
        /**
         * This parameters will enable/disable radiance occlusion by preventing the radiance to lit
         * too much the area relying on ambient texture to define their ambient occlusion.
         */
        _this.useRadianceOcclusion = true;
        /**
         * If set to true, no lighting calculations will be applied.
         */
        _this.unlit = false;
        _this._environmentBRDFTexture = BRDFTextureTools.GetEnvironmentBRDFTexture(scene);
        return _this;
    }
    Object.defineProperty(PBRMaterial.prototype, "refractionTexture", {
        /**
         * Stores the refracted light information in a texture.
         */
        get: function () {
            return this.subSurface.refractionTexture;
        },
        set: function (value) {
            this.subSurface.refractionTexture = value;
            if (value) {
                this.subSurface.isRefractionEnabled = true;
            }
            else if (!this.subSurface.linkRefractionWithTransparency) {
                this.subSurface.isRefractionEnabled = false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "indexOfRefraction", {
        /**
         * source material index of refraction (IOR)' / 'destination material IOR.
         */
        get: function () {
            return 1 / this.subSurface.indexOfRefraction;
        },
        set: function (value) {
            this.subSurface.indexOfRefraction = 1 / value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "invertRefractionY", {
        /**
         * Controls if refraction needs to be inverted on Y. This could be useful for procedural texture.
         */
        get: function () {
            return this.subSurface.invertRefractionY;
        },
        set: function (value) {
            this.subSurface.invertRefractionY = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "linkRefractionWithTransparency", {
        /**
         * This parameters will make the material used its opacity to control how much it is refracting aginst not.
         * Materials half opaque for instance using refraction could benefit from this control.
         */
        get: function () {
            return this.subSurface.linkRefractionWithTransparency;
        },
        set: function (value) {
            this.subSurface.linkRefractionWithTransparency = value;
            if (value) {
                this.subSurface.isRefractionEnabled = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "usePhysicalLightFalloff", {
        /**
         * BJS is using an harcoded light falloff based on a manually sets up range.
         * In PBR, one way to represents the fallof is to use the inverse squared root algorythm.
         * This parameter can help you switch back to the BJS mode in order to create scenes using both materials.
         */
        get: function () {
            return this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL;
        },
        /**
         * BJS is using an harcoded light falloff based on a manually sets up range.
         * In PBR, one way to represents the fallof is to use the inverse squared root algorythm.
         * This parameter can help you switch back to the BJS mode in order to create scenes using both materials.
         */
        set: function (value) {
            if (value !== this.usePhysicalLightFalloff) {
                // Ensure the effect will be rebuilt.
                this._markAllSubMeshesAsTexturesDirty();
                if (value) {
                    this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL;
                }
                else {
                    this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_STANDARD;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "useGLTFLightFalloff", {
        /**
         * In order to support the falloff compatibility with gltf, a special mode has been added
         * to reproduce the gltf light falloff.
         */
        get: function () {
            return this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_GLTF;
        },
        /**
         * In order to support the falloff compatibility with gltf, a special mode has been added
         * to reproduce the gltf light falloff.
         */
        set: function (value) {
            if (value !== this.useGLTFLightFalloff) {
                // Ensure the effect will be rebuilt.
                this._markAllSubMeshesAsTexturesDirty();
                if (value) {
                    this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_GLTF;
                }
                else {
                    this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_STANDARD;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "imageProcessingConfiguration", {
        /**
         * Gets the image processing configuration used either in this material.
         */
        get: function () {
            return this._imageProcessingConfiguration;
        },
        /**
         * Sets the Default image processing configuration used either in the this material.
         *
         * If sets to null, the scene one is in use.
         */
        set: function (value) {
            this._attachImageProcessingConfiguration(value);
            // Ensure the effect will be rebuilt.
            this._markAllSubMeshesAsTexturesDirty();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraColorCurvesEnabled", {
        /**
         * Gets wether the color curves effect is enabled.
         */
        get: function () {
            return this.imageProcessingConfiguration.colorCurvesEnabled;
        },
        /**
         * Sets wether the color curves effect is enabled.
         */
        set: function (value) {
            this.imageProcessingConfiguration.colorCurvesEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraColorGradingEnabled", {
        /**
         * Gets wether the color grading effect is enabled.
         */
        get: function () {
            return this.imageProcessingConfiguration.colorGradingEnabled;
        },
        /**
         * Gets wether the color grading effect is enabled.
         */
        set: function (value) {
            this.imageProcessingConfiguration.colorGradingEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraToneMappingEnabled", {
        /**
         * Gets wether tonemapping is enabled or not.
         */
        get: function () {
            return this._imageProcessingConfiguration.toneMappingEnabled;
        },
        /**
         * Sets wether tonemapping is enabled or not
         */
        set: function (value) {
            this._imageProcessingConfiguration.toneMappingEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraExposure", {
        /**
         * The camera exposure used on this material.
         * This property is here and not in the camera to allow controlling exposure without full screen post process.
         * This corresponds to a photographic exposure.
         */
        get: function () {
            return this._imageProcessingConfiguration.exposure;
        },
        /**
         * The camera exposure used on this material.
         * This property is here and not in the camera to allow controlling exposure without full screen post process.
         * This corresponds to a photographic exposure.
         */
        set: function (value) {
            this._imageProcessingConfiguration.exposure = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraContrast", {
        /**
         * Gets The camera contrast used on this material.
         */
        get: function () {
            return this._imageProcessingConfiguration.contrast;
        },
        /**
         * Sets The camera contrast used on this material.
         */
        set: function (value) {
            this._imageProcessingConfiguration.contrast = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraColorGradingTexture", {
        /**
         * Gets the Color Grading 2D Lookup Texture.
         */
        get: function () {
            return this._imageProcessingConfiguration.colorGradingTexture;
        },
        /**
         * Sets the Color Grading 2D Lookup Texture.
         */
        set: function (value) {
            this._imageProcessingConfiguration.colorGradingTexture = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PBRMaterial.prototype, "cameraColorCurves", {
        /**
         * The color grading curves provide additional color adjustmnent that is applied after any color grading transform (3D LUT).
         * They allow basic adjustment of saturation and small exposure adjustments, along with color filter tinting to provide white balance adjustment or more stylistic effects.
         * These are similar to controls found in many professional imaging or colorist software. The global controls are applied to the entire image. For advanced tuning, extra controls are provided to adjust the shadow, midtone and highlight areas of the image;
         * corresponding to low luminance, medium luminance, and high luminance areas respectively.
         */
        get: function () {
            return this._imageProcessingConfiguration.colorCurves;
        },
        /**
         * The color grading curves provide additional color adjustmnent that is applied after any color grading transform (3D LUT).
         * They allow basic adjustment of saturation and small exposure adjustments, along with color filter tinting to provide white balance adjustment or more stylistic effects.
         * These are similar to controls found in many professional imaging or colorist software. The global controls are applied to the entire image. For advanced tuning, extra controls are provided to adjust the shadow, midtone and highlight areas of the image;
         * corresponding to low luminance, medium luminance, and high luminance areas respectively.
         */
        set: function (value) {
            this._imageProcessingConfiguration.colorCurves = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the name of this material class.
     */
    PBRMaterial.prototype.getClassName = function () {
        return "PBRMaterial";
    };
    /**
     * Makes a duplicate of the current material.
     * @param name - name to use for the new material.
     */
    PBRMaterial.prototype.clone = function (name) {
        var _this = this;
        var clone = SerializationHelper.Clone(function () { return new PBRMaterial(name, _this.getScene()); }, this);
        clone.id = name;
        clone.name = name;
        this.clearCoat.copyTo(clone.clearCoat);
        this.anisotropy.copyTo(clone.anisotropy);
        this.brdf.copyTo(clone.brdf);
        this.sheen.copyTo(clone.sheen);
        return clone;
    };
    /**
     * Serializes this PBR Material.
     * @returns - An object with the serialized material.
     */
    PBRMaterial.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.PBRMaterial";
        serializationObject.clearCoat = this.clearCoat.serialize();
        serializationObject.anisotropy = this.anisotropy.serialize();
        serializationObject.brdf = this.brdf.serialize();
        serializationObject.sheen = this.sheen.serialize();
        return serializationObject;
    };
    // Statics
    /**
     * Parses a PBR Material from a serialized object.
     * @param source - Serialized object.
     * @param scene - BJS scene instance.
     * @param rootUrl - url for the scene object
     * @returns - PBRMaterial
     */
    PBRMaterial.Parse = function (source, scene, rootUrl) {
        var material = SerializationHelper.Parse(function () { return new PBRMaterial(source.name, scene); }, source, scene, rootUrl);
        if (source.clearCoat) {
            material.clearCoat.parse(source.clearCoat);
        }
        if (source.anisotropy) {
            material.anisotropy.parse(source.anisotropy);
        }
        if (source.brdf) {
            material.brdf.parse(source.brdf);
        }
        if (source.sheen) {
            material.sheen.parse(source.brdf);
        }
        return material;
    };
    /**
     * PBRMaterialTransparencyMode: No transparency mode, Alpha channel is not use.
     */
    PBRMaterial.PBRMATERIAL_OPAQUE = PBRBaseMaterial.PBRMATERIAL_OPAQUE;
    /**
     * PBRMaterialTransparencyMode: Alpha Test mode, pixel are discarded below a certain threshold defined by the alpha cutoff value.
     */
    PBRMaterial.PBRMATERIAL_ALPHATEST = PBRBaseMaterial.PBRMATERIAL_ALPHATEST;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     */
    PBRMaterial.PBRMATERIAL_ALPHABLEND = PBRBaseMaterial.PBRMATERIAL_ALPHABLEND;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     * They are also discarded below the alpha cutoff threshold to improve performances.
     */
    PBRMaterial.PBRMATERIAL_ALPHATESTANDBLEND = PBRBaseMaterial.PBRMATERIAL_ALPHATESTANDBLEND;
    /**
     * Defines the default value of how much AO map is occluding the analytical lights
     * (point spot...).
     */
    PBRMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS = PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS;
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "directIntensity", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "emissiveIntensity", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "environmentIntensity", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "specularIntensity", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "disableBumpMap", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "albedoTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "ambientTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "ambientTextureStrength", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "ambientTextureImpactOnAnalyticalLights", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], PBRMaterial.prototype, "opacityTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "reflectionTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "emissiveTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "reflectivityTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "metallicTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "metallic", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "roughness", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "microSurfaceTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "bumpTexture", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty", null)
    ], PBRMaterial.prototype, "lightmapTexture", void 0);
    __decorate([
        serializeAsColor3("ambient"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "ambientColor", void 0);
    __decorate([
        serializeAsColor3("albedo"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "albedoColor", void 0);
    __decorate([
        serializeAsColor3("reflectivity"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "reflectivityColor", void 0);
    __decorate([
        serializeAsColor3("reflection"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "reflectionColor", void 0);
    __decorate([
        serializeAsColor3("emissive"),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "emissiveColor", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "microSurface", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useLightmapAsShadowmap", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], PBRMaterial.prototype, "useAlphaFromAlbedoTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], PBRMaterial.prototype, "forceAlphaTest", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], PBRMaterial.prototype, "alphaCutOff", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useSpecularOverAlpha", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useMicroSurfaceFromReflectivityMapAlpha", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useRoughnessFromMetallicTextureAlpha", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useRoughnessFromMetallicTextureGreen", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useMetallnessFromMetallicTextureBlue", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useAmbientOcclusionFromMetallicTextureRed", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useAmbientInGrayScale", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useAutoMicroSurfaceFromReflectivityMap", void 0);
    __decorate([
        serialize()
    ], PBRMaterial.prototype, "usePhysicalLightFalloff", null);
    __decorate([
        serialize()
    ], PBRMaterial.prototype, "useGLTFLightFalloff", null);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useRadianceOverAlpha", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useObjectSpaceNormalMap", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useParallax", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useParallaxOcclusion", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "parallaxScaleBias", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsLightsDirty")
    ], PBRMaterial.prototype, "disableLighting", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "forceIrradianceInFragment", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsLightsDirty")
    ], PBRMaterial.prototype, "maxSimultaneousLights", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "invertNormalMapX", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "invertNormalMapY", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "twoSidedLighting", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useAlphaFresnel", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useLinearAlphaFresnel", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "environmentBRDFTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "forceNormalForward", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "enableSpecularAntiAliasing", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useHorizonOcclusion", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMaterial.prototype, "useRadianceOcclusion", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRMaterial.prototype, "unlit", void 0);
    return PBRMaterial;
}(PBRBaseMaterial));
_TypeStore.RegisteredTypes["BABYLON.PBRMaterial"] = PBRMaterial;

var name$h = 'rgbdEncodePixelShader';
var shader$h = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\n#include<helperFunctions>\nvoid main(void)\n{\ngl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);\n}";
Effect.ShadersStore[name$h] = shader$h;

/**
 * Sets of helpers addressing the serialization and deserialization of environment texture
 * stored in a BabylonJS env file.
 * Those files are usually stored as .env files.
 */
var EnvironmentTextureTools = /** @class */ (function () {
    function EnvironmentTextureTools() {
    }
    /**
     * Gets the environment info from an env file.
     * @param data The array buffer containing the .env bytes.
     * @returns the environment file info (the json header) if successfully parsed.
     */
    EnvironmentTextureTools.GetEnvInfo = function (data) {
        var dataView = new DataView(data);
        var pos = 0;
        for (var i = 0; i < EnvironmentTextureTools._MagicBytes.length; i++) {
            if (dataView.getUint8(pos++) !== EnvironmentTextureTools._MagicBytes[i]) {
                Logger.Error('Not a babylon environment map');
                return null;
            }
        }
        // Read json manifest - collect characters up to null terminator
        var manifestString = '';
        var charCode = 0x00;
        while ((charCode = dataView.getUint8(pos++))) {
            manifestString += String.fromCharCode(charCode);
        }
        var manifest = JSON.parse(manifestString);
        if (manifest.specular) {
            // Extend the header with the position of the payload.
            manifest.specular.specularDataPosition = pos;
            // Fallback to 0.8 exactly if lodGenerationScale is not defined for backward compatibility.
            manifest.specular.lodGenerationScale = manifest.specular.lodGenerationScale || 0.8;
        }
        return manifest;
    };
    /**
     * Creates an environment texture from a loaded cube texture.
     * @param texture defines the cube texture to convert in env file
     * @return a promise containing the environment data if succesfull.
     */
    EnvironmentTextureTools.CreateEnvTextureAsync = function (texture) {
        var _this = this;
        var internalTexture = texture.getInternalTexture();
        if (!internalTexture) {
            return Promise.reject("The cube texture is invalid.");
        }
        if (!texture._prefiltered) {
            return Promise.reject("The cube texture is invalid (not prefiltered).");
        }
        var engine = internalTexture.getEngine();
        if (engine && engine.premultipliedAlpha) {
            return Promise.reject("Env texture can only be created when the engine is created with the premultipliedAlpha option set to false.");
        }
        if (texture.textureType === Constants.TEXTURETYPE_UNSIGNED_INT) {
            return Promise.reject("The cube texture should allow HDR (Full Float or Half Float).");
        }
        var canvas = engine.getRenderingCanvas();
        if (!canvas) {
            return Promise.reject("Env texture can only be created when the engine is associated to a canvas.");
        }
        var textureType = Constants.TEXTURETYPE_FLOAT;
        if (!engine.getCaps().textureFloatRender) {
            textureType = Constants.TEXTURETYPE_HALF_FLOAT;
            if (!engine.getCaps().textureHalfFloatRender) {
                return Promise.reject("Env texture can only be created when the browser supports half float or full float rendering.");
            }
        }
        var cubeWidth = internalTexture.width;
        var hostingScene = new Scene(engine);
        var specularTextures = {};
        var promises = [];
        // Read and collect all mipmaps data from the cube.
        var mipmapsCount = Scalar.Log2(internalTexture.width);
        mipmapsCount = Math.round(mipmapsCount);
        var _loop_1 = function (i) {
            var faceWidth = Math.pow(2, mipmapsCount - i);
            var _loop_2 = function (face) {
                var data = texture.readPixels(face, i);
                // Creates a temp texture with the face data.
                var tempTexture = engine.createRawTexture(data, faceWidth, faceWidth, Constants.TEXTUREFORMAT_RGBA, false, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE, null, textureType);
                // And rgbdEncode them.
                var promise = new Promise(function (resolve, reject) {
                    var rgbdPostProcess = new PostProcess("rgbdEncode", "rgbdEncode", null, null, 1, null, Constants.TEXTURE_NEAREST_SAMPLINGMODE, engine, false, undefined, Constants.TEXTURETYPE_UNSIGNED_INT, undefined, null, false);
                    rgbdPostProcess.getEffect().executeWhenCompiled(function () {
                        rgbdPostProcess.onApply = function (effect) {
                            effect._bindTexture("textureSampler", tempTexture);
                        };
                        // As the process needs to happen on the main canvas, keep track of the current size
                        var currentW = engine.getRenderWidth();
                        var currentH = engine.getRenderHeight();
                        // Set the desired size for the texture
                        engine.setSize(faceWidth, faceWidth);
                        hostingScene.postProcessManager.directRender([rgbdPostProcess], null);
                        // Reading datas from WebGL
                        Tools.ToBlob(canvas, function (blob) {
                            var fileReader = new FileReader();
                            fileReader.onload = function (event) {
                                var arrayBuffer = event.target.result;
                                specularTextures[i * 6 + face] = arrayBuffer;
                                resolve();
                            };
                            fileReader.readAsArrayBuffer(blob);
                        });
                        // Reapply the previous canvas size
                        engine.setSize(currentW, currentH);
                    });
                });
                promises.push(promise);
            };
            // All faces of the cube.
            for (var face = 0; face < 6; face++) {
                _loop_2(face);
            }
        };
        for (var i = 0; i <= mipmapsCount; i++) {
            _loop_1(i);
        }
        // Once all the textures haves been collected as RGBD stored in PNGs
        return Promise.all(promises).then(function () {
            // We can delete the hosting scene keeping track of all the creation objects
            hostingScene.dispose();
            // Creates the json header for the env texture
            var info = {
                version: 1,
                width: cubeWidth,
                irradiance: _this._CreateEnvTextureIrradiance(texture),
                specular: {
                    mipmaps: [],
                    lodGenerationScale: texture.lodGenerationScale
                }
            };
            // Sets the specular image data information
            var position = 0;
            for (var i = 0; i <= mipmapsCount; i++) {
                for (var face = 0; face < 6; face++) {
                    var byteLength = specularTextures[i * 6 + face].byteLength;
                    info.specular.mipmaps.push({
                        length: byteLength,
                        position: position
                    });
                    position += byteLength;
                }
            }
            // Encode the JSON as an array buffer
            var infoString = JSON.stringify(info);
            var infoBuffer = new ArrayBuffer(infoString.length + 1);
            var infoView = new Uint8Array(infoBuffer); // Limited to ascii subset matching unicode.
            for (var i = 0, strLen = infoString.length; i < strLen; i++) {
                infoView[i] = infoString.charCodeAt(i);
            }
            // Ends up with a null terminator for easier parsing
            infoView[infoString.length] = 0x00;
            // Computes the final required size and creates the storage
            var totalSize = EnvironmentTextureTools._MagicBytes.length + position + infoBuffer.byteLength;
            var finalBuffer = new ArrayBuffer(totalSize);
            var finalBufferView = new Uint8Array(finalBuffer);
            var dataView = new DataView(finalBuffer);
            // Copy the magic bytes identifying the file in
            var pos = 0;
            for (var i = 0; i < EnvironmentTextureTools._MagicBytes.length; i++) {
                dataView.setUint8(pos++, EnvironmentTextureTools._MagicBytes[i]);
            }
            // Add the json info
            finalBufferView.set(new Uint8Array(infoBuffer), pos);
            pos += infoBuffer.byteLength;
            // Finally inserts the texture data
            for (var i = 0; i <= mipmapsCount; i++) {
                for (var face = 0; face < 6; face++) {
                    var dataBuffer = specularTextures[i * 6 + face];
                    finalBufferView.set(new Uint8Array(dataBuffer), pos);
                    pos += dataBuffer.byteLength;
                }
            }
            // Voila
            return finalBuffer;
        });
    };
    /**
     * Creates a JSON representation of the spherical data.
     * @param texture defines the texture containing the polynomials
     * @return the JSON representation of the spherical info
     */
    EnvironmentTextureTools._CreateEnvTextureIrradiance = function (texture) {
        var polynmials = texture.sphericalPolynomial;
        if (polynmials == null) {
            return null;
        }
        return {
            x: [polynmials.x.x, polynmials.x.y, polynmials.x.z],
            y: [polynmials.y.x, polynmials.y.y, polynmials.y.z],
            z: [polynmials.z.x, polynmials.z.y, polynmials.z.z],
            xx: [polynmials.xx.x, polynmials.xx.y, polynmials.xx.z],
            yy: [polynmials.yy.x, polynmials.yy.y, polynmials.yy.z],
            zz: [polynmials.zz.x, polynmials.zz.y, polynmials.zz.z],
            yz: [polynmials.yz.x, polynmials.yz.y, polynmials.yz.z],
            zx: [polynmials.zx.x, polynmials.zx.y, polynmials.zx.z],
            xy: [polynmials.xy.x, polynmials.xy.y, polynmials.xy.z]
        };
    };
    /**
     * Uploads the texture info contained in the env file to the GPU.
     * @param texture defines the internal texture to upload to
     * @param arrayBuffer defines the buffer cotaining the data to load
     * @param info defines the texture info retrieved through the GetEnvInfo method
     * @returns a promise
     */
    EnvironmentTextureTools.UploadEnvLevelsAsync = function (texture, arrayBuffer, info) {
        if (info.version !== 1) {
            throw new Error("Unsupported babylon environment map version \"" + info.version + "\"");
        }
        var specularInfo = info.specular;
        if (!specularInfo) {
            // Nothing else parsed so far
            return Promise.resolve();
        }
        // Double checks the enclosed info
        var mipmapsCount = Scalar.Log2(info.width);
        mipmapsCount = Math.round(mipmapsCount) + 1;
        if (specularInfo.mipmaps.length !== 6 * mipmapsCount) {
            throw new Error("Unsupported specular mipmaps number \"" + specularInfo.mipmaps.length + "\"");
        }
        texture._lodGenerationScale = specularInfo.lodGenerationScale;
        var imageData = new Array(mipmapsCount);
        for (var i = 0; i < mipmapsCount; i++) {
            imageData[i] = new Array(6);
            for (var face = 0; face < 6; face++) {
                var imageInfo = specularInfo.mipmaps[i * 6 + face];
                imageData[i][face] = new Uint8Array(arrayBuffer, specularInfo.specularDataPosition + imageInfo.position, imageInfo.length);
            }
        }
        return EnvironmentTextureTools.UploadLevelsAsync(texture, imageData);
    };
    /**
     * Uploads the levels of image data to the GPU.
     * @param texture defines the internal texture to upload to
     * @param imageData defines the array buffer views of image data [mipmap][face]
     * @returns a promise
     */
    EnvironmentTextureTools.UploadLevelsAsync = function (texture, imageData) {
        if (!Tools.IsExponentOfTwo(texture.width)) {
            throw new Error("Texture size must be a power of two");
        }
        var mipmapsCount = Math.round(Scalar.Log2(texture.width)) + 1;
        // Gets everything ready.
        var engine = texture.getEngine();
        var expandTexture = false;
        var generateNonLODTextures = false;
        var rgbdPostProcess = null;
        var cubeRtt = null;
        var lodTextures = null;
        var caps = engine.getCaps();
        texture.format = Constants.TEXTUREFORMAT_RGBA;
        texture.type = Constants.TEXTURETYPE_UNSIGNED_INT;
        texture.generateMipMaps = true;
        engine.updateTextureSamplingMode(Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, texture);
        // Add extra process if texture lod is not supported
        if (!caps.textureLOD) {
            expandTexture = false;
            generateNonLODTextures = true;
            lodTextures = {};
        }
        // in webgl 1 there are no ways to either render or copy lod level information for float textures.
        else if (engine.webGLVersion < 2) {
            expandTexture = false;
        }
        // If half float available we can uncompress the texture
        else if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
            expandTexture = true;
            texture.type = Constants.TEXTURETYPE_HALF_FLOAT;
        }
        // If full float available we can uncompress the texture
        else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
            expandTexture = true;
            texture.type = Constants.TEXTURETYPE_FLOAT;
        }
        // Expand the texture if possible
        if (expandTexture) {
            // Simply run through the decode PP
            rgbdPostProcess = new PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, engine, false, undefined, texture.type, undefined, null, false);
            texture._isRGBD = false;
            texture.invertY = false;
            cubeRtt = engine.createRenderTargetCubeTexture(texture.width, {
                generateDepthBuffer: false,
                generateMipMaps: true,
                generateStencilBuffer: false,
                samplingMode: Constants.TEXTURE_TRILINEAR_SAMPLINGMODE,
                type: texture.type,
                format: Constants.TEXTUREFORMAT_RGBA
            });
        }
        else {
            texture._isRGBD = true;
            texture.invertY = true;
            // In case of missing support, applies the same patch than DDS files.
            if (generateNonLODTextures) {
                var mipSlices = 3;
                var scale = texture._lodGenerationScale;
                var offset = texture._lodGenerationOffset;
                for (var i = 0; i < mipSlices; i++) {
                    //compute LOD from even spacing in smoothness (matching shader calculation)
                    var smoothness = i / (mipSlices - 1);
                    var roughness = 1 - smoothness;
                    var minLODIndex = offset; // roughness = 0
                    var maxLODIndex = (mipmapsCount - 1) * scale + offset; // roughness = 1 (mipmaps start from 0)
                    var lodIndex = minLODIndex + (maxLODIndex - minLODIndex) * roughness;
                    var mipmapIndex = Math.round(Math.min(Math.max(lodIndex, 0), maxLODIndex));
                    var glTextureFromLod = new InternalTexture(engine, InternalTexture.DATASOURCE_TEMP);
                    glTextureFromLod.isCube = true;
                    glTextureFromLod.invertY = true;
                    glTextureFromLod.generateMipMaps = false;
                    engine.updateTextureSamplingMode(Constants.TEXTURE_LINEAR_LINEAR, glTextureFromLod);
                    // Wrap in a base texture for easy binding.
                    var lodTexture = new BaseTexture(null);
                    lodTexture.isCube = true;
                    lodTexture._texture = glTextureFromLod;
                    lodTextures[mipmapIndex] = lodTexture;
                    switch (i) {
                        case 0:
                            texture._lodTextureLow = lodTexture;
                            break;
                        case 1:
                            texture._lodTextureMid = lodTexture;
                            break;
                        case 2:
                            texture._lodTextureHigh = lodTexture;
                            break;
                    }
                }
            }
        }
        var promises = [];
        var _loop_3 = function (i) {
            var _loop_4 = function (face) {
                // Constructs an image element from image data
                var bytes = imageData[i][face];
                var blob = new Blob([bytes], { type: 'image/png' });
                var url = URL.createObjectURL(blob);
                var image = new Image();
                image.src = url;
                // Enqueue promise to upload to the texture.
                var promise = new Promise(function (resolve, reject) {
                    image.onload = function () {
                        if (expandTexture) {
                            var tempTexture_1 = engine.createTexture(null, true, true, null, Constants.TEXTURE_NEAREST_SAMPLINGMODE, null, function (message) {
                                reject(message);
                            }, image);
                            rgbdPostProcess.getEffect().executeWhenCompiled(function () {
                                // Uncompress the data to a RTT
                                rgbdPostProcess.onApply = function (effect) {
                                    effect._bindTexture("textureSampler", tempTexture_1);
                                    effect.setFloat2("scale", 1, 1);
                                };
                                engine.scenes[0].postProcessManager.directRender([rgbdPostProcess], cubeRtt, true, face, i);
                                // Cleanup
                                engine.restoreDefaultFramebuffer();
                                tempTexture_1.dispose();
                                window.URL.revokeObjectURL(url);
                                resolve();
                            });
                        }
                        else {
                            engine._uploadImageToTexture(texture, image, face, i);
                            // Upload the face to the non lod texture support
                            if (generateNonLODTextures) {
                                var lodTexture = lodTextures[i];
                                if (lodTexture) {
                                    engine._uploadImageToTexture(lodTexture._texture, image, face, 0);
                                }
                            }
                            resolve();
                        }
                    };
                    image.onerror = function (error) {
                        reject(error);
                    };
                });
                promises.push(promise);
            };
            // All faces
            for (var face = 0; face < 6; face++) {
                _loop_4(face);
            }
        };
        // All mipmaps up to provided number of images
        for (var i = 0; i < imageData.length; i++) {
            _loop_3(i);
        }
        // Fill remaining mipmaps with black textures.
        if (imageData.length < mipmapsCount) {
            var data = void 0;
            var size = Math.pow(2, mipmapsCount - 1 - imageData.length);
            var dataLength = size * size * 4;
            switch (texture.type) {
                case Constants.TEXTURETYPE_UNSIGNED_INT: {
                    data = new Uint8Array(dataLength);
                    break;
                }
                case Constants.TEXTURETYPE_HALF_FLOAT: {
                    data = new Uint16Array(dataLength);
                    break;
                }
                case Constants.TEXTURETYPE_FLOAT: {
                    data = new Float32Array(dataLength);
                    break;
                }
            }
            for (var i = imageData.length; i < mipmapsCount; i++) {
                for (var face = 0; face < 6; face++) {
                    engine._uploadArrayBufferViewToTexture(texture, data, face, i);
                }
            }
        }
        // Once all done, finishes the cleanup and return
        return Promise.all(promises).then(function () {
            // Release temp RTT.
            if (cubeRtt) {
                engine._releaseFramebufferObjects(cubeRtt);
                cubeRtt._swapAndDie(texture);
            }
            // Release temp Post Process.
            if (rgbdPostProcess) {
                rgbdPostProcess.dispose();
            }
            // Flag internal texture as ready in case they are in use.
            if (generateNonLODTextures) {
                if (texture._lodTextureHigh && texture._lodTextureHigh._texture) {
                    texture._lodTextureHigh._texture.isReady = true;
                }
                if (texture._lodTextureMid && texture._lodTextureMid._texture) {
                    texture._lodTextureMid._texture.isReady = true;
                }
                if (texture._lodTextureLow && texture._lodTextureLow._texture) {
                    texture._lodTextureLow._texture.isReady = true;
                }
            }
        });
    };
    /**
     * Uploads spherical polynomials information to the texture.
     * @param texture defines the texture we are trying to upload the information to
     * @param info defines the environment texture info retrieved through the GetEnvInfo method
     */
    EnvironmentTextureTools.UploadEnvSpherical = function (texture, info) {
        if (info.version !== 1) {
            Logger.Warn('Unsupported babylon environment map version "' + info.version + '"');
        }
        var irradianceInfo = info.irradiance;
        if (!irradianceInfo) {
            return;
        }
        var sp = new SphericalPolynomial();
        Vector3.FromArrayToRef(irradianceInfo.x, 0, sp.x);
        Vector3.FromArrayToRef(irradianceInfo.y, 0, sp.y);
        Vector3.FromArrayToRef(irradianceInfo.z, 0, sp.z);
        Vector3.FromArrayToRef(irradianceInfo.xx, 0, sp.xx);
        Vector3.FromArrayToRef(irradianceInfo.yy, 0, sp.yy);
        Vector3.FromArrayToRef(irradianceInfo.zz, 0, sp.zz);
        Vector3.FromArrayToRef(irradianceInfo.yz, 0, sp.yz);
        Vector3.FromArrayToRef(irradianceInfo.zx, 0, sp.zx);
        Vector3.FromArrayToRef(irradianceInfo.xy, 0, sp.xy);
        texture._sphericalPolynomial = sp;
    };
    /** @hidden */
    EnvironmentTextureTools._UpdateRGBDAsync = function (internalTexture, data, sphericalPolynomial, lodScale, lodOffset) {
        internalTexture._dataSource = InternalTexture.DATASOURCE_CUBERAW_RGBD;
        internalTexture._bufferViewArrayArray = data;
        internalTexture._lodGenerationScale = lodScale;
        internalTexture._lodGenerationOffset = lodOffset;
        internalTexture._sphericalPolynomial = sphericalPolynomial;
        return EnvironmentTextureTools.UploadLevelsAsync(internalTexture, data).then(function () {
            internalTexture.isReady = true;
        });
    };
    /**
     * Magic number identifying the env file.
     */
    EnvironmentTextureTools._MagicBytes = [0x86, 0x16, 0x87, 0x96, 0xf6, 0xd6, 0x96, 0x36];
    return EnvironmentTextureTools;
}());
// References the dependencies.
InternalTexture._UpdateRGBDAsync = EnvironmentTextureTools._UpdateRGBDAsync;

Node.AddNodeConstructor("Light_Type_0", function (name, scene) {
    return function () { return new PointLight(name, Vector3.Zero(), scene); };
});
/**
 * A point light is a light defined by an unique point in world space.
 * The light is emitted in every direction from this point.
 * A good example of a point light is a standard light bulb.
 * Documentation: https://doc.babylonjs.com/babylon101/lights
 */
var PointLight = /** @class */ (function (_super) {
    __extends(PointLight, _super);
    /**
     * Creates a PointLight object from the passed name and position (Vector3) and adds it in the scene.
     * A PointLight emits the light in every direction.
     * It can cast shadows.
     * If the scene camera is already defined and you want to set your PointLight at the camera position, just set it :
     * ```javascript
     * var pointLight = new PointLight("pl", camera.position, scene);
     * ```
     * Documentation : https://doc.babylonjs.com/babylon101/lights
     * @param name The light friendly name
     * @param position The position of the point light in the scene
     * @param scene The scene the lights belongs to
     */
    function PointLight(name, position, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._shadowAngle = Math.PI / 2;
        _this.position = position;
        return _this;
    }
    Object.defineProperty(PointLight.prototype, "shadowAngle", {
        /**
         * Getter: In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
         * This specifies what angle the shadow will use to be created.
         *
         * It default to 90 degrees to work nicely with the cube texture generation for point lights shadow maps.
         */
        get: function () {
            return this._shadowAngle;
        },
        /**
         * Setter: In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
         * This specifies what angle the shadow will use to be created.
         *
         * It default to 90 degrees to work nicely with the cube texture generation for point lights shadow maps.
         */
        set: function (value) {
            this._shadowAngle = value;
            this.forceProjectionMatrixCompute();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PointLight.prototype, "direction", {
        /**
         * Gets the direction if it has been set.
         * In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
         */
        get: function () {
            return this._direction;
        },
        /**
         * In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
         */
        set: function (value) {
            var previousNeedCube = this.needCube();
            this._direction = value;
            if (this.needCube() !== previousNeedCube && this._shadowGenerator) {
                this._shadowGenerator.recreateShadowMap();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the string "PointLight"
     * @returns the class name
     */
    PointLight.prototype.getClassName = function () {
        return "PointLight";
    };
    /**
     * Returns the integer 0.
     * @returns The light Type id as a constant defines in Light.LIGHTTYPEID_x
     */
    PointLight.prototype.getTypeID = function () {
        return Light.LIGHTTYPEID_POINTLIGHT;
    };
    /**
     * Specifies wether or not the shadowmap should be a cube texture.
     * @returns true if the shadowmap needs to be a cube texture.
     */
    PointLight.prototype.needCube = function () {
        return !this.direction;
    };
    /**
     * Returns a new Vector3 aligned with the PointLight cube system according to the passed cube face index (integer).
     * @param faceIndex The index of the face we are computed the direction to generate shadow
     * @returns The set direction in 2d mode otherwise the direction to the cubemap face if needCube() is true
     */
    PointLight.prototype.getShadowDirection = function (faceIndex) {
        if (this.direction) {
            return _super.prototype.getShadowDirection.call(this, faceIndex);
        }
        else {
            switch (faceIndex) {
                case 0:
                    return new Vector3(1.0, 0.0, 0.0);
                case 1:
                    return new Vector3(-1.0, 0.0, 0.0);
                case 2:
                    return new Vector3(0.0, -1.0, 0.0);
                case 3:
                    return new Vector3(0.0, 1.0, 0.0);
                case 4:
                    return new Vector3(0.0, 0.0, 1.0);
                case 5:
                    return new Vector3(0.0, 0.0, -1.0);
            }
        }
        return Vector3.Zero();
    };
    /**
     * Sets the passed matrix "matrix" as a left-handed perspective projection matrix with the following settings :
     * - fov = PI / 2
     * - aspect ratio : 1.0
     * - z-near and far equal to the active camera minZ and maxZ.
     * Returns the PointLight.
     */
    PointLight.prototype._setDefaultShadowProjectionMatrix = function (matrix, viewMatrix, renderList) {
        var activeCamera = this.getScene().activeCamera;
        if (!activeCamera) {
            return;
        }
        Matrix.PerspectiveFovLHToRef(this.shadowAngle, 1.0, this.getDepthMinZ(activeCamera), this.getDepthMaxZ(activeCamera), matrix);
    };
    PointLight.prototype._buildUniformLayout = function () {
        this._uniformBuffer.addUniform("vLightData", 4);
        this._uniformBuffer.addUniform("vLightDiffuse", 4);
        this._uniformBuffer.addUniform("vLightSpecular", 3);
        this._uniformBuffer.addUniform("vLightFalloff", 4);
        this._uniformBuffer.addUniform("shadowsInfo", 3);
        this._uniformBuffer.addUniform("depthValues", 2);
        this._uniformBuffer.create();
    };
    /**
     * Sets the passed Effect "effect" with the PointLight transformed position (or position, if none) and passed name (string).
     * @param effect The effect to update
     * @param lightIndex The index of the light in the effect to update
     * @returns The point light
     */
    PointLight.prototype.transferToEffect = function (effect, lightIndex) {
        if (this.computeTransformedInformation()) {
            this._uniformBuffer.updateFloat4("vLightData", this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z, 0.0, lightIndex);
        }
        else {
            this._uniformBuffer.updateFloat4("vLightData", this.position.x, this.position.y, this.position.z, 0, lightIndex);
        }
        this._uniformBuffer.updateFloat4("vLightFalloff", this.range, this._inverseSquaredRange, 0, 0, lightIndex);
        return this;
    };
    /**
     * Prepares the list of defines specific to the light type.
     * @param defines the list of defines
     * @param lightIndex defines the index of the light for the effect
     */
    PointLight.prototype.prepareLightSpecificDefines = function (defines, lightIndex) {
        defines["POINTLIGHT" + lightIndex] = true;
    };
    __decorate([
        serialize()
    ], PointLight.prototype, "shadowAngle", null);
    return PointLight;
}(ShadowLight));

/**
 * Defines a target to use with MorphTargetManager
 * @see http://doc.babylonjs.com/how_to/how_to_use_morphtargets
 */
var MorphTarget = /** @class */ (function () {
    /**
     * Creates a new MorphTarget
     * @param name defines the name of the target
     * @param influence defines the influence to use
     * @param scene defines the scene the morphtarget belongs to
     */
    function MorphTarget(
    /** defines the name of the target */
    name, influence, scene) {
        if (influence === void 0) { influence = 0; }
        if (scene === void 0) { scene = null; }
        this.name = name;
        /**
         * Gets or sets the list of animations
         */
        this.animations = new Array();
        this._positions = null;
        this._normals = null;
        this._tangents = null;
        /**
         * Observable raised when the influence changes
         */
        this.onInfluenceChanged = new Observable();
        /** @hidden */
        this._onDataLayoutChanged = new Observable();
        this._animationPropertiesOverride = null;
        this._scene = scene || EngineStore.LastCreatedScene;
        this.influence = influence;
    }
    Object.defineProperty(MorphTarget.prototype, "influence", {
        /**
         * Gets or sets the influence of this target (ie. its weight in the overall morphing)
         */
        get: function () {
            return this._influence;
        },
        set: function (influence) {
            if (this._influence === influence) {
                return;
            }
            var previous = this._influence;
            this._influence = influence;
            if (this.onInfluenceChanged.hasObservers) {
                this.onInfluenceChanged.notifyObservers(previous === 0 || influence === 0);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTarget.prototype, "animationPropertiesOverride", {
        /**
         * Gets or sets the animation properties override
         */
        get: function () {
            if (!this._animationPropertiesOverride && this._scene) {
                return this._scene.animationPropertiesOverride;
            }
            return this._animationPropertiesOverride;
        },
        set: function (value) {
            this._animationPropertiesOverride = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTarget.prototype, "hasPositions", {
        /**
         * Gets a boolean defining if the target contains position data
         */
        get: function () {
            return !!this._positions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTarget.prototype, "hasNormals", {
        /**
         * Gets a boolean defining if the target contains normal data
         */
        get: function () {
            return !!this._normals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTarget.prototype, "hasTangents", {
        /**
         * Gets a boolean defining if the target contains tangent data
         */
        get: function () {
            return !!this._tangents;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Affects position data to this target
     * @param data defines the position data to use
     */
    MorphTarget.prototype.setPositions = function (data) {
        var hadPositions = this.hasPositions;
        this._positions = data;
        if (hadPositions !== this.hasPositions) {
            this._onDataLayoutChanged.notifyObservers(undefined);
        }
    };
    /**
     * Gets the position data stored in this target
     * @returns a FloatArray containing the position data (or null if not present)
     */
    MorphTarget.prototype.getPositions = function () {
        return this._positions;
    };
    /**
     * Affects normal data to this target
     * @param data defines the normal data to use
     */
    MorphTarget.prototype.setNormals = function (data) {
        var hadNormals = this.hasNormals;
        this._normals = data;
        if (hadNormals !== this.hasNormals) {
            this._onDataLayoutChanged.notifyObservers(undefined);
        }
    };
    /**
     * Gets the normal data stored in this target
     * @returns a FloatArray containing the normal data (or null if not present)
     */
    MorphTarget.prototype.getNormals = function () {
        return this._normals;
    };
    /**
     * Affects tangent data to this target
     * @param data defines the tangent data to use
     */
    MorphTarget.prototype.setTangents = function (data) {
        var hadTangents = this.hasTangents;
        this._tangents = data;
        if (hadTangents !== this.hasTangents) {
            this._onDataLayoutChanged.notifyObservers(undefined);
        }
    };
    /**
     * Gets the tangent data stored in this target
     * @returns a FloatArray containing the tangent data (or null if not present)
     */
    MorphTarget.prototype.getTangents = function () {
        return this._tangents;
    };
    /**
     * Serializes the current target into a Serialization object
     * @returns the serialized object
     */
    MorphTarget.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.influence = this.influence;
        serializationObject.positions = Array.prototype.slice.call(this.getPositions());
        if (this.id != null) {
            serializationObject.id = this.id;
        }
        if (this.hasNormals) {
            serializationObject.normals = Array.prototype.slice.call(this.getNormals());
        }
        if (this.hasTangents) {
            serializationObject.tangents = Array.prototype.slice.call(this.getTangents());
        }
        // Animations
        SerializationHelper.AppendSerializedAnimations(this, serializationObject);
        return serializationObject;
    };
    /**
     * Returns the string "MorphTarget"
     * @returns "MorphTarget"
     */
    MorphTarget.prototype.getClassName = function () {
        return "MorphTarget";
    };
    // Statics
    /**
     * Creates a new target from serialized data
     * @param serializationObject defines the serialized data to use
     * @returns a new MorphTarget
     */
    MorphTarget.Parse = function (serializationObject) {
        var result = new MorphTarget(serializationObject.name, serializationObject.influence);
        result.setPositions(serializationObject.positions);
        if (serializationObject.id != null) {
            result.id = serializationObject.id;
        }
        if (serializationObject.normals) {
            result.setNormals(serializationObject.normals);
        }
        if (serializationObject.tangents) {
            result.setTangents(serializationObject.tangents);
        }
        // Animations
        if (serializationObject.animations) {
            for (var animationIndex = 0; animationIndex < serializationObject.animations.length; animationIndex++) {
                var parsedAnimation = serializationObject.animations[animationIndex];
                var internalClass = _TypeStore.GetClass("BABYLON.Animation");
                if (internalClass) {
                    result.animations.push(internalClass.Parse(parsedAnimation));
                }
            }
        }
        return result;
    };
    /**
     * Creates a MorphTarget from mesh data
     * @param mesh defines the source mesh
     * @param name defines the name to use for the new target
     * @param influence defines the influence to attach to the target
     * @returns a new MorphTarget
     */
    MorphTarget.FromMesh = function (mesh, name, influence) {
        if (!name) {
            name = mesh.name;
        }
        var result = new MorphTarget(name, influence, mesh.getScene());
        result.setPositions(mesh.getVerticesData(VertexBuffer.PositionKind));
        if (mesh.isVerticesDataPresent(VertexBuffer.NormalKind)) {
            result.setNormals(mesh.getVerticesData(VertexBuffer.NormalKind));
        }
        if (mesh.isVerticesDataPresent(VertexBuffer.TangentKind)) {
            result.setTangents(mesh.getVerticesData(VertexBuffer.TangentKind));
        }
        return result;
    };
    __decorate([
        serialize()
    ], MorphTarget.prototype, "id", void 0);
    return MorphTarget;
}());

/**
 * This class is used to deform meshes using morphing between different targets
 * @see http://doc.babylonjs.com/how_to/how_to_use_morphtargets
 */
var MorphTargetManager = /** @class */ (function () {
    /**
     * Creates a new MorphTargetManager
     * @param scene defines the current scene
     */
    function MorphTargetManager(scene) {
        if (scene === void 0) { scene = null; }
        this._targets = new Array();
        this._targetInfluenceChangedObservers = new Array();
        this._targetDataLayoutChangedObservers = new Array();
        this._activeTargets = new SmartArray(16);
        this._supportsNormals = false;
        this._supportsTangents = false;
        this._vertexCount = 0;
        this._uniqueId = 0;
        this._tempInfluences = new Array();
        if (!scene) {
            scene = EngineStore.LastCreatedScene;
        }
        this._scene = scene;
        if (this._scene) {
            this._scene.morphTargetManagers.push(this);
            this._uniqueId = this._scene.getUniqueId();
        }
    }
    Object.defineProperty(MorphTargetManager.prototype, "uniqueId", {
        /**
         * Gets the unique ID of this manager
         */
        get: function () {
            return this._uniqueId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "vertexCount", {
        /**
         * Gets the number of vertices handled by this manager
         */
        get: function () {
            return this._vertexCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "supportsNormals", {
        /**
         * Gets a boolean indicating if this manager supports morphing of normals
         */
        get: function () {
            return this._supportsNormals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "supportsTangents", {
        /**
         * Gets a boolean indicating if this manager supports morphing of tangents
         */
        get: function () {
            return this._supportsTangents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "numTargets", {
        /**
         * Gets the number of targets stored in this manager
         */
        get: function () {
            return this._targets.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "numInfluencers", {
        /**
         * Gets the number of influencers (ie. the number of targets with influences > 0)
         */
        get: function () {
            return this._activeTargets.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "influences", {
        /**
         * Gets the list of influences (one per target)
         */
        get: function () {
            return this._influences;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the active target at specified index. An active target is a target with an influence > 0
     * @param index defines the index to check
     * @returns the requested target
     */
    MorphTargetManager.prototype.getActiveTarget = function (index) {
        return this._activeTargets.data[index];
    };
    /**
     * Gets the target at specified index
     * @param index defines the index to check
     * @returns the requested target
     */
    MorphTargetManager.prototype.getTarget = function (index) {
        return this._targets[index];
    };
    /**
     * Add a new target to this manager
     * @param target defines the target to add
     */
    MorphTargetManager.prototype.addTarget = function (target) {
        var _this = this;
        this._targets.push(target);
        this._targetInfluenceChangedObservers.push(target.onInfluenceChanged.add(function (needUpdate) {
            _this._syncActiveTargets(needUpdate);
        }));
        this._targetDataLayoutChangedObservers.push(target._onDataLayoutChanged.add(function () {
            _this._syncActiveTargets(true);
        }));
        this._syncActiveTargets(true);
    };
    /**
     * Removes a target from the manager
     * @param target defines the target to remove
     */
    MorphTargetManager.prototype.removeTarget = function (target) {
        var index = this._targets.indexOf(target);
        if (index >= 0) {
            this._targets.splice(index, 1);
            target.onInfluenceChanged.remove(this._targetInfluenceChangedObservers.splice(index, 1)[0]);
            target._onDataLayoutChanged.remove(this._targetDataLayoutChangedObservers.splice(index, 1)[0]);
            this._syncActiveTargets(true);
        }
    };
    /**
     * Serializes the current manager into a Serialization object
     * @returns the serialized object
     */
    MorphTargetManager.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.id = this.uniqueId;
        serializationObject.targets = [];
        for (var _i = 0, _a = this._targets; _i < _a.length; _i++) {
            var target = _a[_i];
            serializationObject.targets.push(target.serialize());
        }
        return serializationObject;
    };
    MorphTargetManager.prototype._syncActiveTargets = function (needUpdate) {
        var influenceCount = 0;
        this._activeTargets.reset();
        this._supportsNormals = true;
        this._supportsTangents = true;
        this._vertexCount = 0;
        for (var _i = 0, _a = this._targets; _i < _a.length; _i++) {
            var target = _a[_i];
            if (target.influence === 0) {
                continue;
            }
            this._activeTargets.push(target);
            this._tempInfluences[influenceCount++] = target.influence;
            this._supportsNormals = this._supportsNormals && target.hasNormals;
            this._supportsTangents = this._supportsTangents && target.hasTangents;
            var positions = target.getPositions();
            if (positions) {
                var vertexCount = positions.length / 3;
                if (this._vertexCount === 0) {
                    this._vertexCount = vertexCount;
                }
                else if (this._vertexCount !== vertexCount) {
                    Logger.Error("Incompatible target. Targets must all have the same vertices count.");
                    return;
                }
            }
        }
        if (!this._influences || this._influences.length !== influenceCount) {
            this._influences = new Float32Array(influenceCount);
        }
        for (var index = 0; index < influenceCount; index++) {
            this._influences[index] = this._tempInfluences[index];
        }
        if (needUpdate) {
            this.synchronize();
        }
    };
    /**
     * Syncrhonize the targets with all the meshes using this morph target manager
     */
    MorphTargetManager.prototype.synchronize = function () {
        if (!this._scene) {
            return;
        }
        // Flag meshes as dirty to resync with the active targets
        for (var _i = 0, _a = this._scene.meshes; _i < _a.length; _i++) {
            var mesh = _a[_i];
            if (mesh.morphTargetManager === this) {
                mesh._syncGeometryWithMorphTargetManager();
            }
        }
    };
    // Statics
    /**
     * Creates a new MorphTargetManager from serialized data
     * @param serializationObject defines the serialized data
     * @param scene defines the hosting scene
     * @returns the new MorphTargetManager
     */
    MorphTargetManager.Parse = function (serializationObject, scene) {
        var result = new MorphTargetManager(scene);
        result._uniqueId = serializationObject.id;
        for (var _i = 0, _a = serializationObject.targets; _i < _a.length; _i++) {
            var targetData = _a[_i];
            result.addTarget(MorphTarget.Parse(targetData));
        }
        return result;
    };
    return MorphTargetManager;
}());

/**
 * Raw cube texture where the raw buffers are passed in
 */
var RawCubeTexture = /** @class */ (function (_super) {
    __extends(RawCubeTexture, _super);
    /**
     * Creates a cube texture where the raw buffers are passed in.
     * @param scene defines the scene the texture is attached to
     * @param data defines the array of data to use to create each face
     * @param size defines the size of the textures
     * @param format defines the format of the data
     * @param type defines the type of the data (like Engine.TEXTURETYPE_UNSIGNED_INT)
     * @param generateMipMaps  defines if the engine should generate the mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (like Texture.NEAREST_SAMPLINGMODE)
     * @param compression defines the compression used (null by default)
     */
    function RawCubeTexture(scene, data, size, format, type, generateMipMaps, invertY, samplingMode, compression) {
        if (format === void 0) { format = Constants.TEXTUREFORMAT_RGBA; }
        if (type === void 0) { type = Constants.TEXTURETYPE_UNSIGNED_INT; }
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        if (invertY === void 0) { invertY = false; }
        if (samplingMode === void 0) { samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE; }
        if (compression === void 0) { compression = null; }
        var _this = _super.call(this, "", scene) || this;
        _this._texture = scene.getEngine().createRawCubeTexture(data, size, format, type, generateMipMaps, invertY, samplingMode, compression);
        return _this;
    }
    /**
     * Updates the raw cube texture.
     * @param data defines the data to store
     * @param format defines the data format
     * @param type defines the type fo the data (Engine.TEXTURETYPE_UNSIGNED_INT by default)
     * @param invertY defines if data must be stored with Y axis inverted
     * @param compression defines the compression used (null by default)
     * @param level defines which level of the texture to update
     */
    RawCubeTexture.prototype.update = function (data, format, type, invertY, compression) {
        if (compression === void 0) { compression = null; }
        this._texture.getEngine().updateRawCubeTexture(this._texture, data, format, type, invertY, compression);
    };
    /**
     * Updates a raw cube texture with RGBD encoded data.
     * @param data defines the array of data [mipmap][face] to use to create each face
     * @param sphericalPolynomial defines the spherical polynomial for irradiance
     * @param lodScale defines the scale applied to environment texture. This manages the range of LOD level used for IBL according to the roughness
     * @param lodOffset defines the offset applied to environment texture. This manages first LOD level used for IBL according to the roughness
     * @returns a promsie that resolves when the operation is complete
     */
    RawCubeTexture.prototype.updateRGBDAsync = function (data, sphericalPolynomial, lodScale, lodOffset) {
        if (sphericalPolynomial === void 0) { sphericalPolynomial = null; }
        if (lodScale === void 0) { lodScale = 0.8; }
        if (lodOffset === void 0) { lodOffset = 0; }
        return RawCubeTexture._UpdateRGBDAsync(this._texture, data, sphericalPolynomial, lodScale, lodOffset);
    };
    /**
     * Clones the raw cube texture.
     * @return a new cube texture
     */
    RawCubeTexture.prototype.clone = function () {
        var _this = this;
        return SerializationHelper.Clone(function () {
            var scene = _this.getScene();
            var internalTexture = _this._texture;
            var texture = new RawCubeTexture(scene, internalTexture._bufferViewArray, internalTexture.width, internalTexture.format, internalTexture.type, internalTexture.generateMipMaps, internalTexture.invertY, internalTexture.samplingMode, internalTexture._compression);
            if (internalTexture.dataSource === InternalTexture.DATASOURCE_CUBERAW_RGBD) {
                texture.updateRGBDAsync(internalTexture._bufferViewArrayArray, internalTexture._sphericalPolynomial, internalTexture._lodGenerationScale, internalTexture._lodGenerationOffset);
            }
            return texture;
        }, this);
    };
    /** @hidden */
    RawCubeTexture._UpdateRGBDAsync = function (internalTexture, data, sphericalPolynomial, lodScale, lodOffset) {
        internalTexture._dataSource = InternalTexture.DATASOURCE_CUBERAW_RGBD;
        internalTexture._bufferViewArrayArray = data;
        internalTexture._lodGenerationScale = lodScale;
        internalTexture._lodGenerationOffset = lodOffset;
        internalTexture._sphericalPolynomial = sphericalPolynomial;
        return EnvironmentTextureTools.UploadLevelsAsync(internalTexture, data).then(function () {
            internalTexture.isReady = true;
        });
    };
    return RawCubeTexture;
}(CubeTexture));

/**
 * Helper class to push actions to a pool of workers.
 */
var WorkerPool = /** @class */ (function () {
    /**
     * Constructor
     * @param workers Array of workers to use for actions
     */
    function WorkerPool(workers) {
        this._pendingActions = new Array();
        this._workerInfos = workers.map(function (worker) { return ({
            worker: worker,
            active: false
        }); });
    }
    /**
     * Terminates all workers and clears any pending actions.
     */
    WorkerPool.prototype.dispose = function () {
        for (var _i = 0, _a = this._workerInfos; _i < _a.length; _i++) {
            var workerInfo = _a[_i];
            workerInfo.worker.terminate();
        }
        delete this._workerInfos;
        delete this._pendingActions;
    };
    /**
     * Pushes an action to the worker pool. If all the workers are active, the action will be
     * pended until a worker has completed its action.
     * @param action The action to perform. Call onComplete when the action is complete.
     */
    WorkerPool.prototype.push = function (action) {
        for (var _i = 0, _a = this._workerInfos; _i < _a.length; _i++) {
            var workerInfo = _a[_i];
            if (!workerInfo.active) {
                this._execute(workerInfo, action);
                return;
            }
        }
        this._pendingActions.push(action);
    };
    WorkerPool.prototype._execute = function (workerInfo, action) {
        var _this = this;
        workerInfo.active = true;
        action(workerInfo.worker, function () {
            workerInfo.active = false;
            var nextAction = _this._pendingActions.shift();
            if (nextAction) {
                _this._execute(workerInfo, nextAction);
            }
        });
    };
    return WorkerPool;
}());

function loadScriptAsync(url) {
    if (typeof importScripts === "function") {
        importScripts(url);
        return Promise.resolve();
    }
    else {
        return new Promise(function (resolve, reject) {
            Tools.LoadScript(url, function () {
                resolve();
            }, function (message) {
                reject(new Error(message));
            });
        });
    }
}
function loadFileAsync(url) {
    return new Promise(function (resolve, reject) {
        Tools.LoadFile(url, function (data) {
            resolve(data);
        }, undefined, undefined, true, function (request, exception) {
            reject(exception);
        });
    });
}
function createDecoderAsync(wasmUrl, wasmBinary, fallbackUrl) {
    var decoderUrl = (wasmBinary && wasmUrl) || fallbackUrl;
    if (decoderUrl) {
        return loadScriptAsync(decoderUrl).then(function () {
            return new Promise(function (resolve) {
                DracoDecoderModule({ wasmBinary: wasmBinary }).then(function (module) {
                    resolve({ module: module });
                });
            });
        });
    }
    return undefined;
}
function decodeMesh(decoderModule, dataView, attributes, onIndicesData, onAttributeData) {
    var buffer = new decoderModule.DecoderBuffer();
    buffer.Init(dataView, dataView.byteLength);
    var decoder = new decoderModule.Decoder();
    var geometry;
    var status;
    try {
        var type = decoder.GetEncodedGeometryType(buffer);
        switch (type) {
            case decoderModule.TRIANGULAR_MESH:
                geometry = new decoderModule.Mesh();
                status = decoder.DecodeBufferToMesh(buffer, geometry);
                break;
            case decoderModule.POINT_CLOUD:
                geometry = new decoderModule.PointCloud();
                status = decoder.DecodeBufferToPointCloud(buffer, geometry);
                break;
            default:
                throw new Error("Invalid geometry type " + type);
        }
        if (!status.ok() || !geometry.ptr) {
            throw new Error(status.error_msg());
        }
        var numPoints_1 = geometry.num_points();
        if (type === decoderModule.TRIANGULAR_MESH) {
            var numFaces = geometry.num_faces();
            var faceIndices = new decoderModule.DracoInt32Array();
            try {
                var indices = new Uint32Array(numFaces * 3);
                for (var i = 0; i < numFaces; i++) {
                    decoder.GetFaceFromMesh(geometry, i, faceIndices);
                    var offset = i * 3;
                    indices[offset + 0] = faceIndices.GetValue(0);
                    indices[offset + 1] = faceIndices.GetValue(1);
                    indices[offset + 2] = faceIndices.GetValue(2);
                }
                onIndicesData(indices);
            }
            finally {
                decoderModule.destroy(faceIndices);
            }
        }
        var processAttribute = function (kind, attribute) {
            var dracoData = new decoderModule.DracoFloat32Array();
            try {
                decoder.GetAttributeFloatForAllPoints(geometry, attribute, dracoData);
                var babylonData = new Float32Array(numPoints_1 * attribute.num_components());
                for (var i = 0; i < babylonData.length; i++) {
                    babylonData[i] = dracoData.GetValue(i);
                }
                onAttributeData(kind, babylonData);
            }
            finally {
                decoderModule.destroy(dracoData);
            }
        };
        if (attributes) {
            for (var kind in attributes) {
                var id = attributes[kind];
                var attribute = decoder.GetAttributeByUniqueId(geometry, id);
                processAttribute(kind, attribute);
            }
        }
        else {
            var nativeAttributeTypes = {
                "position": "POSITION",
                "normal": "NORMAL",
                "color": "COLOR",
                "uv": "TEX_COORD"
            };
            for (var kind in nativeAttributeTypes) {
                var id = decoder.GetAttributeId(geometry, decoderModule[nativeAttributeTypes[kind]]);
                if (id !== -1) {
                    var attribute = decoder.GetAttribute(geometry, id);
                    processAttribute(kind, attribute);
                }
            }
        }
    }
    finally {
        if (geometry) {
            decoderModule.destroy(geometry);
        }
        decoderModule.destroy(decoder);
        decoderModule.destroy(buffer);
    }
}
/**
 * The worker function that gets converted to a blob url to pass into a worker.
 */
function worker() {
    var decoderPromise;
    onmessage = function (event) {
        var data = event.data;
        switch (data.id) {
            case "init": {
                var decoder = data.decoder;
                decoderPromise = createDecoderAsync(decoder.wasmUrl, decoder.wasmBinary, decoder.fallbackUrl);
                postMessage("done");
                break;
            }
            case "decodeMesh": {
                if (!decoderPromise) {
                    throw new Error("Draco decoder module is not available");
                }
                decoderPromise.then(function (decoder) {
                    decodeMesh(decoder.module, data.dataView, data.attributes, function (indices) {
                        postMessage({ id: "indices", value: indices }, [indices.buffer]);
                    }, function (kind, data) {
                        postMessage({ id: kind, value: data }, [data.buffer]);
                    });
                    postMessage("done");
                });
                break;
            }
        }
    };
}
function getAbsoluteUrl(url) {
    if (typeof document !== "object" || typeof url !== "string") {
        return url;
    }
    return Tools.GetAbsoluteUrl(url);
}
/**
 * Draco compression (https://google.github.io/draco/)
 *
 * This class wraps the Draco module.
 *
 * **Encoder**
 *
 * The encoder is not currently implemented.
 *
 * **Decoder**
 *
 * By default, the configuration points to a copy of the Draco decoder files for glTF from the babylon.js preview cdn https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js.
 *
 * To update the configuration, use the following code:
 * ```javascript
 *     DracoCompression.Configuration = {
 *         decoder: {
 *             wasmUrl: "<url to the WebAssembly library>",
 *             wasmBinaryUrl: "<url to the WebAssembly binary>",
 *             fallbackUrl: "<url to the fallback JavaScript library>",
 *         }
 *     };
 * ```
 *
 * Draco has two versions, one for WebAssembly and one for JavaScript. The decoder configuration can be set to only support Webssembly or only support the JavaScript version.
 * Decoding will automatically fallback to the JavaScript version if WebAssembly version is not configured or if WebAssembly is not supported by the browser.
 * Use `DracoCompression.DecoderAvailable` to determine if the decoder configuration is available for the current context.
 *
 * To decode Draco compressed data, get the default DracoCompression object and call decodeMeshAsync:
 * ```javascript
 *     var vertexData = await DracoCompression.Default.decodeMeshAsync(data);
 * ```
 *
 * @see https://www.babylonjs-playground.com/#N3EK4B#0
 */
var DracoCompression = /** @class */ (function () {
    /**
     * Constructor
     * @param numWorkers The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
     */
    function DracoCompression(numWorkers) {
        if (numWorkers === void 0) { numWorkers = DracoCompression.DefaultNumWorkers; }
        var decoder = DracoCompression.Configuration.decoder;
        var decoderWasmBinaryPromise = (decoder.wasmUrl && decoder.wasmBinaryUrl && typeof WebAssembly === "object")
            ? loadFileAsync(getAbsoluteUrl(decoder.wasmBinaryUrl))
            : Promise.resolve(undefined);
        if (numWorkers && typeof Worker === "function") {
            this._workerPoolPromise = decoderWasmBinaryPromise.then(function (decoderWasmBinary) {
                var workerContent = "" + loadScriptAsync + createDecoderAsync + decodeMesh + "(" + worker + ")()";
                var workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
                var workerPromises = new Array(numWorkers);
                for (var i = 0; i < workerPromises.length; i++) {
                    workerPromises[i] = new Promise(function (resolve, reject) {
                        var worker = new Worker(workerBlobUrl);
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                        };
                        var onMessage = function (message) {
                            if (message.data === "done") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                resolve(worker);
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        worker.postMessage({
                            id: "init",
                            decoder: {
                                wasmUrl: getAbsoluteUrl(decoder.wasmUrl),
                                wasmBinary: decoderWasmBinary,
                                fallbackUrl: getAbsoluteUrl(decoder.fallbackUrl)
                            }
                        });
                    });
                }
                return Promise.all(workerPromises).then(function (workers) {
                    return new WorkerPool(workers);
                });
            });
        }
        else {
            this._decoderModulePromise = decoderWasmBinaryPromise.then(function (decoderWasmBinary) {
                return createDecoderAsync(decoder.wasmUrl, decoderWasmBinary, decoder.fallbackUrl);
            });
        }
    }
    Object.defineProperty(DracoCompression, "DecoderAvailable", {
        /**
         * Returns true if the decoder configuration is available.
         */
        get: function () {
            var decoder = DracoCompression.Configuration.decoder;
            return !!((decoder.wasmUrl && decoder.wasmBinaryUrl && typeof WebAssembly === "object") || decoder.fallbackUrl);
        },
        enumerable: true,
        configurable: true
    });
    DracoCompression.GetDefaultNumWorkers = function () {
        if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
            return 1;
        }
        // Use 50% of the available logical processors but capped at 4.
        return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
    };
    Object.defineProperty(DracoCompression, "Default", {
        /**
         * Default instance for the draco compression object.
         */
        get: function () {
            if (!DracoCompression._Default) {
                DracoCompression._Default = new DracoCompression();
            }
            return DracoCompression._Default;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Stop all async operations and release resources.
     */
    DracoCompression.prototype.dispose = function () {
        if (this._workerPoolPromise) {
            this._workerPoolPromise.then(function (workerPool) {
                workerPool.dispose();
            });
        }
        delete this._workerPoolPromise;
        delete this._decoderModulePromise;
    };
    /**
     * Returns a promise that resolves when ready. Call this manually to ensure draco compression is ready before use.
     * @returns a promise that resolves when ready
     */
    DracoCompression.prototype.whenReadyAsync = function () {
        if (this._workerPoolPromise) {
            return this._workerPoolPromise.then(function () { });
        }
        if (this._decoderModulePromise) {
            return this._decoderModulePromise.then(function () { });
        }
        return Promise.resolve();
    };
    /**
      * Decode Draco compressed mesh data to vertex data.
      * @param data The ArrayBuffer or ArrayBufferView for the Draco compression data
      * @param attributes A map of attributes from vertex buffer kinds to Draco unique ids
      * @returns A promise that resolves with the decoded vertex data
      */
    DracoCompression.prototype.decodeMeshAsync = function (data, attributes) {
        var dataView = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        if (this._workerPoolPromise) {
            return this._workerPoolPromise.then(function (workerPool) {
                return new Promise(function (resolve, reject) {
                    workerPool.push(function (worker, onComplete) {
                        var vertexData = new VertexData();
                        var onError = function (error) {
                            worker.removeEventListener("error", onError);
                            worker.removeEventListener("message", onMessage);
                            reject(error);
                            onComplete();
                        };
                        var onMessage = function (message) {
                            if (message.data === "done") {
                                worker.removeEventListener("error", onError);
                                worker.removeEventListener("message", onMessage);
                                resolve(vertexData);
                                onComplete();
                            }
                            else if (message.data.id === "indices") {
                                vertexData.indices = message.data.value;
                            }
                            else {
                                vertexData.set(message.data.value, message.data.id);
                            }
                        };
                        worker.addEventListener("error", onError);
                        worker.addEventListener("message", onMessage);
                        var dataViewCopy = new Uint8Array(dataView.byteLength);
                        dataViewCopy.set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength));
                        worker.postMessage({ id: "decodeMesh", dataView: dataViewCopy, attributes: attributes }, [dataViewCopy.buffer]);
                    });
                });
            });
        }
        if (this._decoderModulePromise) {
            return this._decoderModulePromise.then(function (decoder) {
                var vertexData = new VertexData();
                decodeMesh(decoder.module, dataView, attributes, function (indices) {
                    vertexData.indices = indices;
                }, function (kind, data) {
                    vertexData.set(data, kind);
                });
                return vertexData;
            });
        }
        throw new Error("Draco decoder module is not available");
    };
    /**
     * The configuration. Defaults to the following urls:
     * - wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js"
     * - wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
     * - fallbackUrl: "https://preview.babylonjs.com/draco_decoder_gltf.js"
     */
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper_gltf.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm",
            fallbackUrl: "https://preview.babylonjs.com/draco_decoder_gltf.js"
        }
    };
    /**
     * Default number of workers to create when creating the draco compression object.
     */
    DracoCompression.DefaultNumWorkers = DracoCompression.GetDefaultNumWorkers();
    DracoCompression._Default = null;
    return DracoCompression;
}());

/**
 * Wrapper class for promise with external resolve and reject.
 */
var Deferred = /** @class */ (function () {
    /**
     * Constructor for this deferred object.
     */
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
        });
    }
    Object.defineProperty(Deferred.prototype, "resolve", {
        /**
         * The resolve method of the promise associated with this deferred object.
         */
        get: function () {
            return this._resolve;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Deferred.prototype, "reject", {
        /**
         * The reject method of the promise associated with this deferred object.
         */
        get: function () {
            return this._reject;
        },
        enumerable: true,
        configurable: true
    });
    return Deferred;
}());

export { Animation as A, Bone as B, CameraInputTypes as C, DirectionalLight as D, EnvironmentTextureTools as E, FreeCameraInputsManager as F, MorphTarget as G, Deferred as H, WorkerPool as I, KeepAssets as K, MorphTargetManager as M, PostProcess as P, RawTexture as R, Sound as S, TargetCamera as T, WeightedSound as W, _IAnimationState as _, CameraInputsManager as a, FreeCamera as b, ShaderMaterial as c, SceneLoader as d, SpotLight as e, CubeTexture as f, PBRMaterial as g, Skeleton as h, AssetContainer as i, AnimationGroup as j, PBRBaseMaterial as k, Animatable as l, TargetedAnimation as m, RuntimeAnimation as n, AnimationEvent as o, AnimationKeyInterpolation as p, AnimationRange as q, FreeCameraKeyboardMoveInput as r, FreeCameraMouseInput as s, FreeCameraTouchInput as t, ShadowLight as u, PointLight as v, SceneLoaderProgressEvent as w, PBRMaterialDefines as x, RawCubeTexture as y, DracoCompression as z };

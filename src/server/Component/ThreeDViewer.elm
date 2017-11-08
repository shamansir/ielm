module Component.ThreeDViewer exposing (..)

{-
    Loosely based on https://github.com/elm-community/webgl/blob/master/examples/thwomp.elm
-}

import Html exposing (Html, text)
import Html.Attributes exposing (width, height, style)
import Math.Matrix4 as Mat4 exposing (Mat4)
import Math.Vector2 as Vec2 exposing (Vec2, vec2)
import Math.Vector3 as Vec3 exposing (Vec3, vec3)
import Mouse
import Task exposing (Task)
import WebGL exposing (Mesh, Shader, Entity)
import WebGL.Texture as Texture exposing (Texture, defaultOptions, Error)
import Window


type alias Vertex =
    { position : Vec3
    , color : Vec3
    }


withMesh : Mouse.Position -> Window.Size -> Mesh Vertex -> Html a
withMesh position size mesh =
    WebGL.toHtml
        [ width size.width
        , height size.height
        , style [ ( "display", "block" ) ]
        ]
        [ toEntity mesh size position
        ]


toEntity : Mesh Vertex -> Window.Size -> Mouse.Position -> Entity
toEntity mesh { width, height } { x, y } =
    WebGL.entity
        vertexShader
        fragmentShader
        mesh
        { perspective =
            perspective
                (toFloat width)
                (toFloat height)
                (toFloat x)
                (toFloat y)
        }


perspective : Float -> Float -> Float -> Float -> Mat4
perspective width height x y =
    let
        eye =
            vec3 (0.5 - x / width) -(0.5 - y / height) 1
                |> Vec3.normalize
                |> Vec3.scale 6
    in
        Mat4.mul
            (Mat4.makePerspective 45 (width / height) 0.01 100)
            (Mat4.makeLookAt eye (vec3 0 0 0) Vec3.j)



type alias Uniforms =
    { perspective : Mat4
    }


vertexShader : Shader Vertex Uniforms { vcolor : Vec3 }
vertexShader =
    [glsl|

        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 perspective;
        varying vec3 vcolor;

        void main () {
          gl_Position = perspective * vec4(position, 1.0);
          vcolor = color;
        }

    |]


fragmentShader : Shader {} Uniforms { vcolor : Vec3 }
fragmentShader =
    [glsl|

        precision mediump float;
        varying vec3 vcolor;

        void main () {
          gl_FragColor = vec4(vcolor, 1.0);
        }

    |]

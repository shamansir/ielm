module Component.ThreeDViewer exposing
    ( withMeshAt
    , withEntityAt
    , adaptPosition
    , size
    , Vertex
    , icosahedron
    , defaultVertexShader
    , defaultFragmentShader
    )

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

size : Window.Size
size = Window.Size 500 500


center : Mouse.Position
center = Mouse.Position (size.width // 2) (size.height // 2)


type alias ColoredVertex v =
    { v
    | position : Vec3
    , color : Vec3
    }


type alias Vertex v =
    { v
    | position : Vec3
    }


type alias Uniforms u =
    { u
    | perspective : Mat4
    }


icosahedron =
    WebGL.triangleStrip
        [ vx -0.26286500 0.0000000 0.42532500
        , vx 0.26286500 0.0000000 0.42532500
        , vx -0.26286500 0.0000000 -0.42532500
        , vx 0.26286500 0.0000000 -0.42532500
        , vx 0.0000000 0.42532500 0.26286500
        , vx 0.0000000 0.42532500 -0.26286500
        , vx 0.0000000 -0.42532500 0.26286500
        , vx 0.0000000 -0.42532500 -0.26286500
        , vx 0.42532500 0.26286500 0.0000000
        , vx -0.42532500 0.26286500 0.0000000
        , vx 0.42532500 -0.26286500 0.0000000
        , vx -0.42532500 -0.26286500 0.0000000
        ]


vx : Float -> Float -> Float -> { position: Vec3 }
vx x y z =
    { position = (vec3 x y z) }


-- type alias AnyMesh v = Mesh (Vertex v)
-- type alias AnyShader v u p = Shader (Vertex v) (Uniforms u) p
-- type alias AnyEntity v u p = (AnyMesh v) (AnyShader v u p) (AnyShader v u p)

-- type ViewKind
--     = AMesh (AnyMesh v)
--     | AShader (AnyShader v u p)
--     | AnEntity (AnyEntity v u p)
--     | RawMesh (AnyMesh v)

withMeshAt : Maybe Mouse.Position -> Mesh (Vertex v) -> Html a
withMeshAt position mesh =
    WebGL.toHtmlWith
        [ WebGL.depth 1
        ]
        [ width size.width
        , height size.height
        , style [ ( "display", "block" ) ]
        ]
        [ mesh |> toEntity (position |> Maybe.withDefault center)
        ]


withEntityAt : Maybe Mouse.Position -> ( { perspective: Mat4 } -> Entity ) -> Html a
withEntityAt position almostEntity =
    let
        { x, y } = position |> Maybe.withDefault center
    in
        WebGL.toHtmlWith
            [ WebGL.depth 1
            ]
            [ width size.width
            , height size.height
            , style [ ( "display", "block" ) ]
            ]
            [ almostEntity
                { perspective =
                    perspective
                        (toFloat size.width)
                        (toFloat size.height)
                        (toFloat x)
                        (toFloat y)
                }
            ]


toEntity : Mouse.Position -> Mesh (Vertex v) -> Entity
toEntity { x, y } mesh =
    WebGL.entity
        defaultVertexShader
        defaultFragmentShader
        mesh
        { perspective =
            perspective
                (toFloat size.width)
                (toFloat size.height)
                (toFloat x)
                (toFloat y)
        }


adaptPosition : Maybe Mouse.Position -> Mouse.Position -> Maybe Mouse.Position
adaptPosition maybeRef global =
    maybeRef |> Maybe.andThen (\ref ->
        let
            adaptedX = global.x - ref.x
            adaptedY = global.y - ref.y
        in
            if adaptedX >= 0 && adaptedY >= 0
            && adaptedX <= size.width && adaptedY <= size.height then
                Just (Mouse.Position adaptedX adaptedY)
            else
                Nothing
    )


perspective : Float -> Float -> Float -> Float -> Mat4
perspective width height x y =
    let
        eye =
            vec3 (0.5 - x / width) -(4.0 - y / height * 8) (cos (2.0 - x / width * 4))
            --vec3 (0.5 - x / width) -(0.5 - y / height) 1
                |> Vec3.normalize
                |> Vec3.scale 6
    in
        Mat4.mul
            (Mat4.makePerspective 45 (width / height) 0.01 100)
            (Mat4.makeLookAt eye (vec3 0 0 0) Vec3.j)



coloredVertexShader : Shader (ColoredVertex v) (Uniforms u) { vcolor : Vec3 }
coloredVertexShader =
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


coloredFragmentShader : Shader {} (Uniforms u) { vcolor : Vec3 }
coloredFragmentShader =
    [glsl|

        precision mediump float;
        varying vec3 vcolor;

        void main () {
          gl_FragColor = vec4(vcolor, 1.0);
        }

    |]

defaultVertexShader : Shader (Vertex v) (Uniforms u) {}
defaultVertexShader =
    [glsl|

        attribute vec3 position;
        uniform mat4 perspective;

        void main () {
          gl_Position = perspective * vec4(position, 1.0);
        }

    |]


defaultFragmentShader : Shader {} (Uniforms u) {}
defaultFragmentShader =
    [glsl|

        precision mediump float;

        void main () {
          gl_FragColor = vec4(vec3(0.7, 0.7, 0.7), 1.0);
        }

    |]

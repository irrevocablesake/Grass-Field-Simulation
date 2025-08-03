uniform vec4 grassParams;
uniform float time;
uniform float windSpeed;

varying vec3 vColor;
varying vec4 vGrassData;
varying vec3 vNormal;
varying vec3 vWorldPosition;

vec3 hash( vec3 p ){
    p = vec3(
        dot( p, vec3( 123.42342, 123.3213, 1323.312 )),
        dot( p, vec3( 234.242, 2342.1231, 13.12312 )),
        dot( p, vec3( 123.231, 113.1231, 134.3421 ))
    );

    return -1.0 + 2.0 * fract( sin( p ) * 4564453.2344 );
}

mat3 rotateY( float theta ){
    float c = cos( theta );
    float s = sin( theta );

    return mat3( 
        vec3( c, 0, s ),
        vec3( 0, 1, 0 ),
        vec3( -s, 0, c )
    );
}

float inverseLerp( float v, float minValue, float maxValue ){
    return ( v - minValue ) / ( maxValue - minValue );
}

float remap( float v, float inMin, float inMax, float outMin, float outMax ){
    float t = inverseLerp( v, inMin, inMax );
    return mix( outMin, outMax, t );
}

float easeOut( float x, float t ){
    return 1.0 - pow( 1.0 - x, t );
}

vec3 bezier( vec3 P0, vec3 P1, vec3 P2, vec3 P3, float t ){
    return ( 1.0 - t ) * ( 1.0 - t ) * ( 1.0 - t ) * P0 +
        3.0 * ( 1.0 - t ) * ( 1.0 - t ) * t * P1 +
        3.0 * ( 1.0 - t ) * t * t * P2 +
        t * t * t * P3;
}

vec3 bezierGrad( vec3 P0, vec3 P1, vec3 P2, vec3 P3, float t ){
    return 3.0 * ( 1.0 - t ) * ( 1.0 -t ) * ( P1 - P0 ) +
    6.0 * ( 1.0 - t ) * t * ( P2 - P1 ) +
    3.0 * t * t * ( P3 - P2 );
}

uvec2 murmurHas21( uint src ) {
    const uint M = 0x5bd1e995u;
    uvec2 h = uvec2( 1190494759u, 2147483647u );
    src *= M;
    src ^= src>>24u;
    src *= M;
    h *= M;
    h ^= src;
    h ^= h>>13u;
    h *= M;
    h ^= h>>15u;

    return h;
}

vec2 hash21( float src ){
    uvec2 h = murmurHas21( floatBitsToUint( src ) );
    return uintBitsToFloat( h & 0x007fffffu | 0x3f800000u ) - 1.0;
}

float noise(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    // Fade curve
    vec3 u = f * f * (3.0 - 2.0 * f);

    // Interpolation of dot products of gradient vectors
    return mix(
        mix(
            mix(dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
            mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x),
            u.y),
        mix(
            mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
            mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x),
            u.y),
        u.z);
}

mat3 rotateAxis(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
    );
}

float saturate( float x ){
    return clamp( x, 0.0, 1.0 );
}

vec2 quickHash( float p ){
    vec2 r = vec2(
        dot( vec2( p ), vec2( 123.123123, 34.12314)),
        dot( vec2( p ), vec2( 1231.123123, 934.123123))
    );

    return fract( sin( r ) * 2342.12312 );
}

const vec3 BASE_COLOR = vec3( 0.1, 0.4, 0.04 );
const vec3 TIP_COLOR = vec3( 0.5, 0.7, 0.3 );

void main() {

    //de-construct the uniform params to usable variables
    int GRASS_SEGMENTS = int( grassParams.x ); 
    int GRASS_VERTICES = ( GRASS_SEGMENTS + 1 ) * 2; 
    float CHUNK_SIZE = grassParams.y ;
    float GRASS_WIDTH = grassParams.z;
    float GRASS_HEIGHT = grassParams.w;

    float windControl = windSpeed * 0.15;

    //use index data to deduce the needed variables, which in turn decide the final position
    int vertFB_ID = gl_VertexID % ( GRASS_VERTICES * 2 ); 
    int vertID = vertFB_ID % GRASS_VERTICES;

    int xTest = vertID & 0x1;
    int zTest = ( vertFB_ID >= GRASS_VERTICES ) ? 1 : -1;

    float xSide = float( xTest );
    float zSide = float ( zTest );
    float heightPercent = float( vertID - xTest ) / ( float( GRASS_SEGMENTS ) * 2.0 );

    //use the height and shape the width
    float height = GRASS_HEIGHT;
    float width = GRASS_WIDTH;
    width = width * easeOut( 1.0 - heightPercent, 4.0 );
    
    float x = ( xSide - 0.5 ) * width;
    float y = heightPercent * height;
    float z = 0.0;

    //offsetting each instance
    vec2 hashedInstanceID = hash21( float( gl_InstanceID ) ) ;
    vec3 grassOffset = vec3( hashedInstanceID.x, 0, hashedInstanceID.y ) * CHUNK_SIZE;

    //generating world position of grass
    vec3 grassWorldPosition = ( modelMatrix * vec4( grassOffset, 1.0 ) ).xyz;

    //height Variation
    float heightNoise = remap( noise( grassWorldPosition * 1.0 ), -1.0, 1.0, 0.8, 1.2 );
    height *= heightNoise;

    //hasing world position for random value
    vec3 hashVal = hash( grassWorldPosition );

    //Bezier curve for animation bending
    float windAngle = 0.5;
    float windStrength = noise( vec3( grassWorldPosition.xz * 0.05, 0.0 ) + time * windControl) ;

    vec3 windAxis = vec3( cos( windAngle ), 0.0, sin( windAngle ));
    float windLeanAngle = windStrength * 1.5 * heightPercent;

    float wind = noise( vec3( grassWorldPosition.xz, time * windControl ) ) * ( windStrength * 0.5  + 0.125);
    float leanFactor = ( remap( hashVal.y, -1.0, 1.0, -0.5, 0.5 ) + wind) * ( windControl > 0.0 ? 1.0 : 0.0 ) ;

    vec3 p1 = vec3( 0.0 );
    vec3 p2 = vec3( 0.0, 0.22, 0.0 );
    vec3 p3 = vec3( 0.0, 0.66, 0.0 );
    vec3 p4 = vec3( 0.0, cos( leanFactor), sin( leanFactor ) );

    vec3 curve = bezier( p1, p2, p3, p4, heightPercent );

    y = curve.y * height;
    z = curve.z * height;

    //generating rotation matrix
    const float PI = 3.14159;
    float angle = remap( hashVal.x, -1.0, 1.0, -PI, PI );

    mat3 grassMatrix = rotateAxis( windAxis, windLeanAngle ) * rotateY( angle );

    //generating normals for lighting
    vec3 curveGrad = bezierGrad( p1, p2, p3, p4, heightPercent );
    mat2 curveRot90 = mat2( 0.0, 1.0, -1.0, 0.0 ) * -zSide;

    vec3 grassLocalNormal = grassMatrix * vec3( 0.0, curveRot90 * curveGrad.yz );

    //A way to blend two color schemes for strands using noise value, vColor is being popoulated using this value
    //useful to have patches of two different colors of grass strands
    vec3 c1 = mix( BASE_COLOR, TIP_COLOR, heightPercent );
    vec3 c2 = mix( vec3( 0.6, 0.6, 0.4 ), vec3(0.72, 0.87, 0.42 ), heightPercent );
    float noiseValue = noise( grassWorldPosition * 0.4 );

    //apply the final position
    vec3 grassLocalPosition = grassMatrix * vec3( x, y, z ) + grassOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( grassLocalPosition, 1.0 );

    //populating varyings
    vColor = mix( c1, c2, smoothstep( -0.5, 0.3, noiseValue ));
    vGrassData = vec4( x, heightPercent, xSide, 0.0 );
    vNormal = normalize( ( modelViewMatrix * vec4( grassLocalNormal, 0.0 )).xyz);
    vWorldPosition = ( modelMatrix * vec4( grassLocalPosition, 1.0 )).xyz;
}
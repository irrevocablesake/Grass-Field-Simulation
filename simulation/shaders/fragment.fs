varying vec3 vColor;
varying vec4 vGrassData;
varying vec3 vNormal;
varying vec3 vWorldPosition;

float inverseLerp( float v, float minValue, float maxValue ){
    return ( v - minValue ) / ( maxValue - minValue );
}

float remap( float v, float inMin, float inMax, float outMin, float outMax ){
    float t = inverseLerp( v, inMin, inMax );
    return mix( outMin, outMax, t );
}

float saturate( float x ){
    return clamp( x, 0.0, 1.0 );
}

vec3 phongSpecular( vec3 normal, vec3 lightDirection, vec3 viewDirection ){
    float dotNL = saturate( dot( normal, lightDirection ));

    vec3 r = normalize( reflect( -lightDirection, normal ));
    float phongValue = max( 0.0, dot( viewDirection, r ) );
    phongValue = pow( phongValue, 32.0 );

    vec3 specular = dotNL * vec3( phongValue );
    return specular;
}

void main(){
    
    //a falloff from the center of the grass to the sides
    float grassX = vGrassData.x;
    vec3 baseColor = mix( vColor * 0.75, vColor, smoothstep( 0.125, 0.0, abs( grassX )));

    //adding very little AO
    float grassY = vGrassData.y;
    float ao = remap( pow( grassY, 0.03 ), 0.0, 1.0, 0.125, 1.0 );

    //specular lighting
    vec3 viewDirection = normalize( cameraPosition - vWorldPosition );
    vec3 lightDirection = normalize( vec3( 45.0, 10.5, -5.0 ));
    vec3 specular = phongSpecular( vNormal, lightDirection, viewDirection );

    //Mix with final color
    vec3 color = baseColor;
    color *= ao;
    color = color + specular * 0.5;

    gl_FragColor = vec4( color, 1.0 );
}
#version 300 es
precision mediump float;

#define MAP_AMBIENT_MASK (1 << 0)
#define MAP_DIFFUSE_MASK (1 << 1)
#define MAP_SPECULAR_MASK (1 << 2)
#define MAP_SHININESS_MASK (1 << 3)
#define MAP_BUMP_MASK (1 << 4)

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
    int maps;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// Vertex Inputs
in vec3 Normal;
in vec3 FragmentPosition;
in vec2 TextureCoords;

// Uniforms
uniform vec3 ViewPosition;
uniform Light light;

uniform Material material;
uniform sampler2D material_ambient;
uniform sampler2D material_diffuse;
uniform sampler2D material_specular;
uniform sampler2D material_shininess;
uniform sampler2D material_bump;

// Output
out vec4 OutColor;

mat3 TBN;

vec3 get_ambient() {
    if ((material.maps & MAP_AMBIENT_MASK) != 0) {
        return texture(material_ambient, TextureCoords).rgb;
    }

    return material.ambient;
}

vec3 get_diffuse() {
    if ((material.maps & MAP_DIFFUSE_MASK) != 0) {
        return texture(material_diffuse, TextureCoords).rgb;
    }

    return material.diffuse;
}

vec3 get_specular() {
    if ((material.maps & MAP_SPECULAR_MASK) != 0) {
        return texture(material_specular, TextureCoords).rgb;
    }

    return material.specular;
}

float get_shininess() {
    if ((material.maps & MAP_SHININESS_MASK) != 0) {
        return texture(material_shininess, TextureCoords).r;
    }

    return material.shininess;
}

mat3 get_TBN() {
    vec3 N = normalize(Normal);

    vec3 position_dx = dFdx(FragmentPosition);
    vec3 position_dy = dFdy(FragmentPosition);
    vec2 textureCoord_dx = dFdx(TextureCoords);
    vec2 textureCoord_dy = dFdy(TextureCoords);

    float r = 1.0 / max((textureCoord_dx.x * textureCoord_dy.y - textureCoord_dy.x * textureCoord_dx.y), 1e-6);
    vec3 T = (position_dx * textureCoord_dy.y - position_dy * textureCoord_dx.y) * r;
    vec3 B = cross(N, T);

    return mat3(normalize(T), normalize(B), N);
}

vec3 get_normal() {
    if ((material.maps & MAP_BUMP_MASK) != 0) {
        vec3 n = texture(material_bump, TextureCoords).rgb * 2.0 - 1.0;
        return normalize(get_TBN() * n);
    }

    return normalize(Normal);
}

void main() {
    vec3 ambient = get_ambient() * light.ambient * get_diffuse();

    vec3 norm = get_normal();
    vec3 lightDirection = normalize(light.position - FragmentPosition);
    float alpha = max(dot(norm, lightDirection), 0.0);

    vec3 diffuse = light.diffuse * (alpha * get_diffuse());

    vec3 viewDirection = normalize(ViewPosition - FragmentPosition);
    vec3 reflectDirection = reflect(-lightDirection, norm);

    float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), max(get_shininess() * 128.0, 1.0));
    vec3 specular = light.specular * (spec * get_specular());

    vec3 result = ambient + diffuse;
    if (dot(Normal, lightDirection) > 0.0) {
        result += specular;
    }

    OutColor = vec4(result, 1.0);
}
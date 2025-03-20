#version 300 es
precision mediump float;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
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
in float MaterialIndex;

// Uniforms
uniform vec3 ViewPosition;
uniform Material material;
uniform Light light;

#define MAX_MATERIALS 128
uniform Material materials[MAX_MATERIALS];

// Output
out vec4 OutColor;

void main()
{
    int materialIndex = int(MaterialIndex);
    vec3 ambient = materials[materialIndex].ambient * light.ambient;

    vec3 norm = normalize(Normal);
    vec3 lightDirection = normalize(light.position - FragmentPosition);
    float alpha = max(dot(norm, lightDirection), 0.0);

    vec3 diffuse = light.diffuse * (alpha * materials[materialIndex].diffuse);

    vec3 viewDirection = normalize(ViewPosition - FragmentPosition);
    vec3 reflectDirection = reflect(-lightDirection, norm);

    float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), max(materials[materialIndex].shininess * 128.0, 1.0));
    vec3 specular = light.specular * (spec * materials[materialIndex].specular);

    vec3 result = ambient + diffuse;
    if (dot(Normal, lightDirection) > 0.0) {
        result += specular;
    }

    OutColor = vec4(result, 1.0);
}
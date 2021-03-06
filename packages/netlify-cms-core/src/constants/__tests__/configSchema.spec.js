import { merge } from 'lodash';
import { validateConfig } from '../configSchema';

describe('config', () => {
  /**
   * Suppress error logging to reduce noise during testing. Jest will still
   * log test failures and associated errors as expected.
   */
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('validateConfig', () => {
    const validConfig = {
      foo: 'bar',
      backend: { name: 'bar' },
      media_folder: 'baz',
      collections: [
        {
          name: 'posts',
          label: 'Posts',
          folder: '_posts',
          fields: [{ name: 'title', label: 'title', widget: 'string' }],
        },
      ],
    };

    it('should not throw if no errors', () => {
      expect(() => {
        validateConfig(validConfig);
      }).not.toThrowError();
    });

    it('should throw if backend is not defined in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar' });
      }).toThrowError("config should have required property 'backend'");
    });

    it('should throw if backend name is not defined in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar', backend: {} });
      }).toThrowError("'backend' should have required property 'name'");
    });

    it('should throw if backend name is not a string in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar', backend: { name: {} } });
      }).toThrowError("'backend.name' should be string");
    });

    it('should throw if backend.open_authoring is not a boolean in config', () => {
      expect(() => {
        validateConfig(merge(validConfig, { backend: { open_authoring: 'true' } }));
      }).toThrowError("'backend.open_authoring' should be boolean");
    });

    it('should not throw if backend.open_authoring is boolean in config', () => {
      expect(() => {
        validateConfig(merge(validConfig, { backend: { open_authoring: true } }));
      }).not.toThrowError();
    });

    it('should throw if backend.auth_scope is not "repo" or "public_repo" in config', () => {
      expect(() => {
        validateConfig(merge(validConfig, { backend: { auth_scope: 'user' } }));
      }).toThrowError("'backend.auth_scope' should be equal to one of the allowed values");
    });

    it('should not throw if backend.auth_scope is one of "repo" or "public_repo" in config', () => {
      expect(() => {
        validateConfig(merge(validConfig, { backend: { auth_scope: 'repo' } }));
      }).not.toThrowError();
      expect(() => {
        validateConfig(merge(validConfig, { backend: { auth_scope: 'public_repo' } }));
      }).not.toThrowError();
    });

    it('should throw if media_folder is not defined in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar', backend: { name: 'bar' } });
      }).toThrowError("config should have required property 'media_folder'");
    });

    it('should throw if media_folder is not a string in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar', backend: { name: 'bar' }, media_folder: {} });
      }).toThrowError("'media_folder' should be string");
    });

    it('should throw if collections is not defined in config', () => {
      expect(() => {
        validateConfig({ foo: 'bar', backend: { name: 'bar' }, media_folder: 'baz' });
      }).toThrowError("config should have required property 'collections'");
    });

    it('should throw if collections not an array in config', () => {
      expect(() => {
        validateConfig({
          foo: 'bar',
          backend: { name: 'bar' },
          media_folder: 'baz',
          collections: {},
        });
      }).toThrowError("'collections' should be array");
    });

    it('should throw if collections is an empty array in config', () => {
      expect(() => {
        validateConfig({
          foo: 'bar',
          backend: { name: 'bar' },
          media_folder: 'baz',
          collections: [],
        });
      }).toThrowError("'collections' should NOT have fewer than 1 items");
    });

    it('should throw if collections is an array with a single null element in config', () => {
      expect(() => {
        validateConfig({
          foo: 'bar',
          backend: { name: 'bar' },
          media_folder: 'baz',
          collections: [null],
        });
      }).toThrowError("'collections[0]' should be object");
    });

    it('should throw if local_backend is not a boolean or plain object', () => {
      expect(() => {
        validateConfig({ ...validConfig, local_backend: [] });
      }).toThrowError("'local_backend' should be boolean");
    });

    it('should throw if local_backend url is not a string', () => {
      expect(() => {
        validateConfig({ ...validConfig, local_backend: { url: [] } });
      }).toThrowError("'local_backend.url' should be string");
    });

    it('should throw if local_backend allowed_hosts is not a string array', () => {
      expect(() => {
        validateConfig({ ...validConfig, local_backend: { allowed_hosts: [true] } });
      }).toThrowError("'local_backend.allowed_hosts[0]' should be string");
    });

    it('should not throw if local_backend is a boolean', () => {
      expect(() => {
        validateConfig({ ...validConfig, local_backend: true });
      }).not.toThrowError();
    });

    it('should not throw if local_backend is a plain object with url string property', () => {
      expect(() => {
        validateConfig({ ...validConfig, local_backend: { url: 'http://localhost:8081/api/v1' } });
      }).not.toThrowError();
    });

    it('should not throw if local_backend is a plain object with allowed_hosts string array property', () => {
      expect(() => {
        validateConfig({
          ...validConfig,
          local_backend: { allowed_hosts: ['192.168.0.1'] },
        });
      }).not.toThrowError();
    });

    it('should throw if collection publish is not a boolean', () => {
      expect(() => {
        validateConfig(merge(validConfig, { collections: [{ publish: 'false' }] }));
      }).toThrowError("'collections[0].publish' should be boolean");
    });

    it('should not throw if collection publish is a boolean', () => {
      expect(() => {
        validateConfig(merge(validConfig, { collections: [{ publish: false }] }));
      }).not.toThrowError();
    });

    it('should throw if collections sortableFields is not a boolean or a string array', () => {
      expect(() => {
        validateConfig(merge({}, validConfig, { collections: [{ sortableFields: 'title' }] }));
      }).toThrowError("'collections[0].sortableFields' should be array");
    });

    it('should allow sortableFields to be a string array', () => {
      expect(() => {
        validateConfig(merge({}, validConfig, { collections: [{ sortableFields: ['title'] }] }));
      }).not.toThrow();
    });

    it('should allow sortableFields to be a an empty array', () => {
      expect(() => {
        validateConfig(merge({}, validConfig, { collections: [{ sortableFields: [] }] }));
      }).not.toThrow();
    });

    it('should throw if collection fields names are not unique', () => {
      expect(() => {
        validateConfig(
          merge(validConfig, {
            collections: [
              {
                fields: [
                  { name: 'title', label: 'title', widget: 'string' },
                  { name: 'title', label: 'other title', widget: 'string' },
                ],
              },
            ],
          }),
        );
      }).toThrowError("'collections[0].fields' fields names must be unique");
    });

    it('should not throw if collection fields are unique across nesting levels', () => {
      expect(() => {
        validateConfig(
          merge(validConfig, {
            collections: [
              {
                fields: [
                  { name: 'title', label: 'title', widget: 'string' },
                  {
                    name: 'object',
                    label: 'Object',
                    widget: 'object',
                    fields: [{ name: 'title', label: 'title', widget: 'string' }],
                  },
                ],
              },
            ],
          }),
        );
      }).not.toThrow();
    });
  });
});

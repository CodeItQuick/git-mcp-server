import { describe, it } from 'mocha';
import { assert } from 'chai';

import { OctoKitContentSupplierTwo } from "./GitHubContentSupplierStubs/stubTwoContent";
import { GithubContentSupplier } from "../../../src/batch-processing/single-repository/github-content/github-content-supplier";
import { MongoDBContentStorage } from "../../../src/batch-processing/single-repository/github-content/mongodb-content-storage";
import { TestableContentDeleteInsertMany } from "./MongoClientStubs/testable-content-delete-insert-many";
import {fetchAndStoreRepositoryContent} from "../../../src/batch-processing/single-repository/github-content/fetch-and-store-content";

describe('fetch-and-store-content', () => {
    it('when fetchAndStoreRepositoryContent is called with valid repository and mocked dependencies returns success message', async () => {
        // Arrange
        const mockContentRetriever = new GithubContentSupplier('fake-token', 0, OctoKitContentSupplierTwo);
        const testableContentDbStorage = new TestableContentDeleteInsertMany();
        const mongoDBContentStorage = new MongoDBContentStorage(
            "mongodb://localhost:27017/",
            "github_data",
            "repository_content",
            testableContentDbStorage
        );

        // Act
        const result = await fetchAndStoreRepositoryContent(
            'CodeItQuick/blackjack-ensemble-blue',
            mockContentRetriever,
            mongoDBContentStorage
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Successfully completed fetching and storing repository content', 'Should mention successful completion');
        assert.include(result.content[0].text, 'CodeItQuick/blackjack-ensemble-blue', 'Should mention the repository name');
        assert.include(result.content[0].text, 'Total files processed: 2', 'Should mention processing 2 files');

        // Verify that content was actually stored in the mock
        const storedContent = testableContentDbStorage.getStoredContent();
        assert.equal(storedContent.length, 2, 'Should have stored 2 content items in mock database');
        assert.equal(storedContent[0].repository, 'CodeItQuick/blackjack-ensemble-blue', 'First content item should have correct repository');
        assert.equal(storedContent[1].repository, 'CodeItQuick/blackjack-ensemble-blue', 'Second content item should have correct repository');
        assert.property(storedContent[0], 'fetched_at', 'First content item should have fetched_at timestamp');
        assert.property(storedContent[1], 'fetched_at', 'Second content item should have fetched_at timestamp');
        assert.property(storedContent[0], 'name', 'First content item should have name property');
        assert.property(storedContent[1], 'name', 'Second content item should have name property');
        assert.property(storedContent[0], 'path', 'First content item should have path property');
        assert.property(storedContent[1], 'path', 'Second content item should have path property');
    });
});
